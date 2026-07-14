import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isTaskStatus } from "@/lib/projects";
import type { Prisma } from "@prisma/client";

// PATCH /api/tasks/:id - edit a task (anyone can edit tasks).
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => null);

  const data: Prisma.ProjectTaskUpdateInput = {};
  if (typeof body?.title === "string") {
    const title = body.title.trim();
    if (!title) {
      return NextResponse.json({ error: "Title cannot be empty" }, { status: 400 });
    }
    data.title = title;
  }
  if (typeof body?.category === "string") data.category = body.category;
  if (typeof body?.dueDate === "string") data.dueDate = body.dueDate;
  if (isTaskStatus(body?.status)) data.status = body.status;
  if (typeof body?.reviewed === "boolean") data.reviewed = body.reviewed;

  // Reassign the task to a different project. Validate the target exists and
  // append it to the end of that project's task order.
  if (typeof body?.projectId === "string") {
    const target = await prisma.project.findUnique({
      where: { id: body.projectId },
      select: { id: true },
    });
    if (!target) {
      return NextResponse.json({ error: "Target project not found" }, { status: 400 });
    }
    data.project = { connect: { id: body.projectId } };
    data.order = await prisma.projectTask.count({
      where: { projectId: body.projectId },
    });
  }

  try {
    const task = await prisma.projectTask.update({ where: { id }, data });
    return NextResponse.json(task);
  } catch {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }
}

// DELETE /api/tasks/:id
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.projectTask.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }
}
