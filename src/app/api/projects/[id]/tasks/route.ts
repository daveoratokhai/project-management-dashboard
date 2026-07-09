import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isTaskStatus } from "@/lib/projects";

// POST /api/projects/:id/tasks - add a task to a project's task list.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params;
  const body = await req.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  if (!title) {
    return NextResponse.json({ error: "Task title is required" }, { status: 400 });
  }

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const last = await prisma.projectTask.findFirst({
    where: { projectId },
    orderBy: { order: "desc" },
  });

  const task = await prisma.projectTask.create({
    data: {
      projectId,
      title,
      category: typeof body?.category === "string" ? body.category : "",
      status: isTaskStatus(body?.status) ? body.status : "Pending",
      dueDate: typeof body?.dueDate === "string" ? body.dueDate : "",
      order: (last?.order ?? -1) + 1,
    },
  });

  return NextResponse.json(task, { status: 201 });
}
