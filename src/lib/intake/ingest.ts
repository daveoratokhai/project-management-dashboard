import { prisma } from "@/lib/prisma";
import {
  triageMessage,
  CONFIDENCE_THRESHOLD,
  type TriageProject,
} from "./triage";

// Holding project for notes the AI could not confidently route. Created on
// demand; a reviewer reassigns its tasks to the right project.
export const INBOX_PROJECT_NAME = "Inbox (unsorted)";

async function ensureInboxProject() {
  const existing = await prisma.project.findFirst({
    where: { name: INBOX_PROJECT_NAME },
  });
  if (existing) return existing;
  return prisma.project.create({
    data: {
      name: INBOX_PROJECT_NAME,
      description:
        "Auto-created holding area for intake notes the AI could not confidently route. Reassign these tasks to the right project after review.",
      status: "active",
    },
  });
}

export type IngestInput = {
  channel: string; // "whatsapp"
  from: string; // sender identity (phone)
  body: string; // text to triage (the transcript, for voice notes)
  transcript?: string; // speech-to-text output, stored on the IntakeMessage
  media?: { url: string; contentType: string }[]; // media references (voice)
};

export type IngestResult = {
  taskTitle: string;
  projectName: string;
  routed: boolean; // true if matched to a real project, false if sent to Inbox
  confidence: number;
};

// Records a raw note, triages it into a task flagged unreviewed, and links the
// two. Confident matches land on the chosen project; everything else goes to
// the Inbox bucket. Throws only if triage itself fails (intake marked failed).
export async function ingestNote({
  channel,
  from,
  body,
  transcript,
  media,
}: IngestInput): Promise<IngestResult> {
  const allProjects = await prisma.project.findMany({
    select: { id: true, name: true, team: true, tech: true, description: true },
  });
  // Never let the AI route a note back into the Inbox bucket itself.
  const candidates: TriageProject[] = allProjects.filter(
    (p) => p.name !== INBOX_PROJECT_NAME,
  );

  const intake = await prisma.intakeMessage.create({
    data: {
      channel,
      rawFrom: from,
      rawBody: body,
      transcript: transcript ?? "",
      mediaJson: JSON.stringify(media ?? []),
    },
  });

  let triage;
  try {
    triage = await triageMessage(body, candidates);
  } catch (err) {
    await prisma.intakeMessage.update({
      where: { id: intake.id },
      data: { status: "failed" },
    });
    throw err;
  }

  const routed =
    triage.projectId != null && triage.confidence >= CONFIDENCE_THRESHOLD;

  let targetProjectId: string;
  let projectName: string;
  if (routed && triage.projectId) {
    targetProjectId = triage.projectId;
    projectName =
      candidates.find((p) => p.id === triage.projectId)?.name ?? "";
  } else {
    const inbox = await ensureInboxProject();
    targetProjectId = inbox.id;
    projectName = inbox.name;
  }

  const order = await prisma.projectTask.count({
    where: { projectId: targetProjectId },
  });

  const task = await prisma.projectTask.create({
    data: {
      projectId: targetProjectId,
      title: triage.title,
      category: triage.category,
      status: "Pending",
      order,
      source: channel,
      reviewed: false,
      intakeMessageId: intake.id,
    },
  });

  await prisma.intakeMessage.update({
    where: { id: intake.id },
    data: {
      aiProjectId: triage.projectId,
      aiConfidence: triage.confidence,
      status: "created",
    },
  });

  return {
    taskTitle: task.title,
    projectName,
    routed,
    confidence: triage.confidence,
  };
}
