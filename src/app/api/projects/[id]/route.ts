import { NextRequest, NextResponse } from "next/server";
import { unlink } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { isStatusVariant, TAG_KEYS, type TagKey } from "@/lib/projects";
import { UPLOAD_DIR } from "@/lib/uploads";
import type { Prisma } from "@prisma/client";

export const runtime = "nodejs";

// PATCH /api/projects/:id - update any subset of a project's fields.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const data: Prisma.ProjectUpdateInput = {};

  if (typeof body.name === "string") {
    const name = body.name.trim();
    if (!name) {
      return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
    }
    data.name = name;
  }
  if (typeof body.repository === "string") data.repository = body.repository;
  if (typeof body.team === "string") data.team = body.team;
  if (typeof body.tech === "string") data.tech = body.tech;
  if (typeof body.description === "string") data.description = body.description;
  if (typeof body.startDate === "string") data.startDate = body.startDate;
  if (typeof body.endDate === "string") data.endDate = body.endDate;
  if (isStatusVariant(body.status)) data.status = body.status;

  if (Array.isArray(body.tags)) {
    const tags: TagKey[] = body.tags.filter((k: unknown): k is TagKey =>
      TAG_KEYS.includes(k as TagKey)
    );
    data.tags = JSON.stringify(tags);
  }

  if (Array.isArray(body.assigneeIds)) {
    const ids: string[] = body.assigneeIds.filter((x: unknown) => typeof x === "string");
    data.assignees = { set: ids.map((pid) => ({ id: pid })) };
  }

  try {
    const project = await prisma.project.update({ where: { id }, data });
    return NextResponse.json(project);
  } catch {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }
}

// DELETE /api/projects/:id - cascade removes its tasks and attachment rows,
// and unlinks the attachment files from disk so they are not orphaned.
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const attachments = await prisma.attachment.findMany({
    where: { projectId: id },
  });
  try {
    await prisma.project.delete({ where: { id } });
  } catch {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }
  await Promise.all(
    attachments.map((att) =>
      unlink(path.join(UPLOAD_DIR, att.storedName)).catch(() => {
        // File already gone; the DB row was removed by the cascade.
      }),
    ),
  );
  return NextResponse.json({ ok: true });
}
