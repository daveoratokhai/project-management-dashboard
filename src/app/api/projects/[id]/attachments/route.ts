import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { UPLOAD_DIR } from "@/lib/uploads";

export const runtime = "nodejs";

const MAX_BYTES = 25 * 1024 * 1024; // 25 MB per file

// POST /api/projects/:id/attachments - multipart upload of a single file.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params;

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File exceeds 25 MB limit" }, { status: 413 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const safeBase = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-100);
  const storedName = `${randomUUID()}-${safeBase}`;

  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, storedName), bytes);

  const attachment = await prisma.attachment.create({
    data: {
      projectId,
      filename: file.name,
      storedName,
      size: bytes.length,
      mimeType: file.type || "application/octet-stream",
    },
  });

  return NextResponse.json(attachment, { status: 201 });
}
