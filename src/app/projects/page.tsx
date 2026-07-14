import { prisma } from "@/lib/prisma";
import { STATUS_LABELS, formatDate, type StatusVariant } from "@/lib/projects";
import type { Project } from "@/components/ui/project-data-table";
import { ProjectsView } from "@/components/projects-view";
import { getSessionProfile } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const [rows, people, profile] = await Promise.all([
    prisma.project.findMany({
      include: { assignees: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.person.findMany({ orderBy: { name: "asc" } }),
    getSessionProfile(),
  ]);

  const projects: Project[] = rows.map((r) => {
    const variant = r.status as StatusVariant;
    return {
      id: r.id,
      name: r.name,
      repository: r.repository,
      team: r.team,
      tech: r.tech,
      createdAt: formatDate(r.createdAt.toISOString().slice(0, 10)),
      contributors: r.assignees.map((a) => ({
        src: a.avatarUrl,
        alt: a.name,
        fallback: a.fallback,
      })),
      status: { text: STATUS_LABELS[variant] ?? r.status, variant },
    };
  });

  const serializedPeople = people.map((p) => ({
    id: p.id,
    name: p.name,
    avatarUrl: p.avatarUrl,
    fallback: p.fallback,
  }));

  return (
    <ProjectsView
      projects={projects}
      people={serializedPeople}
      role={profile?.role ?? "Viewer"}
    />
  );
}
