import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  parseTags,
  type SerializedProject,
  type StatusVariant,
  type TaskStatus,
} from "@/lib/projects";
import { ProjectDetailView } from "@/components/project-detail-view";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [row, people, allProjects] = await Promise.all([
    prisma.project.findUnique({
      where: { id },
      include: {
        assignees: true,
        attachments: { orderBy: { createdAt: "asc" } },
        tasks: { orderBy: { order: "asc" } },
      },
    }),
    prisma.person.findMany({ orderBy: { name: "asc" } }),
    prisma.project.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!row) notFound();

  const project: SerializedProject = {
    id: row.id,
    name: row.name,
    repository: row.repository,
    team: row.team,
    tech: row.tech,
    status: row.status as StatusVariant,
    description: row.description,
    startDate: row.startDate,
    endDate: row.endDate,
    tags: parseTags(row.tags),
    assignees: row.assignees.map((a) => ({
      id: a.id,
      name: a.name,
      avatarUrl: a.avatarUrl,
      fallback: a.fallback,
    })),
    attachments: row.attachments.map((a) => ({
      id: a.id,
      filename: a.filename,
      size: a.size,
      mimeType: a.mimeType,
    })),
    tasks: row.tasks.map((t) => ({
      id: t.id,
      title: t.title,
      category: t.category,
      status: t.status as TaskStatus,
      dueDate: t.dueDate,
      order: t.order,
      source: t.source,
      reviewed: t.reviewed,
    })),
  };

  const serializedPeople = people.map((p) => ({
    id: p.id,
    name: p.name,
    avatarUrl: p.avatarUrl,
    fallback: p.fallback,
  }));

  return (
    <ProjectDetailView
      project={project}
      people={serializedPeople}
      projects={allProjects}
    />
  );
}
