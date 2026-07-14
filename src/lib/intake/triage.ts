import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

// Cheap, fast classification model for triage. Runs inside the WhatsApp
// webhook request, so latency matters; a mini model is the right tier here.
const TRIAGE_MODEL = "gpt-4o-mini";

// Below this confidence (or with no project match), the note is routed to the
// Inbox bucket instead of a guessed project. See ingest.ts.
export const CONFIDENCE_THRESHOLD = 0.5;

export type TriageProject = {
  id: string;
  name: string;
  team: string;
  tech: string;
  description: string;
};

export type TriageResult = {
  // The chosen project id, or null when nothing matched confidently.
  projectId: string | null;
  // A concise, imperative task title.
  title: string;
  // A short area/category label ("" if unclear).
  category: string;
  // 0..1 confidence that projectId is correct (0 when unrouted).
  confidence: number;
};

// The model returns "" for projectId when nothing matches, which keeps the
// strict JSON schema free of nullable unions. Keep this minimal: OpenAI strict
// structured outputs rejects unsupported constraints like min/max.
const RawTriageSchema = z.object({
  projectId: z
    .string()
    .describe(
      "The id of the single best-matching project from the provided list. Empty string if no project clearly matches.",
    ),
  title: z
    .string()
    .describe(
      "A concise, imperative task title summarizing the note (roughly 80 characters or fewer).",
    ),
  category: z
    .string()
    .describe(
      "A short area/category label such as 'Bug', 'Feature', 'Docs', or 'Ops'. Empty string if unclear.",
    ),
  confidence: z
    .number()
    .describe("How confident you are, 0 to 1, that projectId is correct."),
});

const SYSTEM = `You triage freeform notes that team members send into a project tracker. \
Each note should become a single task on the most relevant project. \
You are given the list of existing projects (id, name, team, tech, description) and one note. \
Pick the project whose scope best matches the note and return its id. \
If no project is a clear fit, return an empty string for projectId and a low confidence. \
Write a short, imperative task title that captures the action (not a restatement of the whole message). \
Be honest with the confidence score: only go above 0.5 when the project match is clear.`;

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

// Classifies a note against the given projects. Throws if the API call fails
// or returns no parsed output; the caller records the intake as "failed".
export async function triageMessage(
  body: string,
  projects: TriageProject[],
): Promise<TriageResult> {
  const client = new OpenAI();

  const projectList = projects
    .map(
      (p) =>
        `- id: ${p.id}\n  name: ${p.name}\n  team: ${p.team || "(none)"}\n  tech: ${p.tech || "(none)"}\n  description: ${p.description || "(none)"}`,
    )
    .join("\n");

  const completion = await client.chat.completions.parse({
    model: TRIAGE_MODEL,
    messages: [
      { role: "system", content: SYSTEM },
      {
        role: "user",
        content: `Available projects:\n${projectList || "(none)"}\n\nIncoming note:\n"""\n${body}\n"""`,
      },
    ],
    response_format: zodResponseFormat(RawTriageSchema, "triage"),
  });

  const raw = completion.choices[0]?.message.parsed;
  if (!raw) {
    throw new Error("Triage returned no parsed output");
  }

  const matched =
    raw.projectId !== "" && projects.some((p) => p.id === raw.projectId);

  return {
    projectId: matched ? raw.projectId : null,
    title: raw.title.trim() || body.trim().slice(0, 80),
    category: raw.category.trim(),
    confidence: matched ? clamp01(raw.confidence) : 0,
  };
}
