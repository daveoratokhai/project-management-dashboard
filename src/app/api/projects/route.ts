import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isStatusVariant, TAG_KEYS, type TagKey } from "@/lib/projects";

// POST /api/projects - create a project. Only `name` is required; the rest can
// be filled in on the detail page.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const tags: TagKey[] = Array.isArray(body?.tags)
    ? body.tags.filter((k: unknown): k is TagKey => TAG_KEYS.includes(k as TagKey))
    : [];

  const assigneeIds: string[] = Array.isArray(body?.assigneeIds)
    ? body.assigneeIds.filter((x: unknown) => typeof x === "string")
    : [];

  const project = await prisma.project.create({
    data: {
      name,
      repository: typeof body?.repository === "string" ? body.repository : "",
      team: typeof body?.team === "string" ? body.team : "",
      tech: typeof body?.tech === "string" ? body.tech : "",
      status: isStatusVariant(body?.status) ? body.status : "active",
      description: typeof body?.description === "string" ? body.description : "",
      startDate: typeof body?.startDate === "string" ? body.startDate : "",
      endDate: typeof body?.endDate === "string" ? body.endDate : "",
      tags: JSON.stringify(tags),
      assignees: { connect: assigneeIds.map((id) => ({ id })) },
    },
  });

  return NextResponse.json(project, { status: 201 });
}
