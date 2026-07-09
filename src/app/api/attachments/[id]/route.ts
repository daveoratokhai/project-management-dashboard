import { NextRequest, NextResponse } from "next/server";
import { unlink } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { UPLOAD_DIR } from "@/lib/uploads";

export const runtime = "nodejs";

// DELETE /api/attachments/:id - remove the row and the file on disk.
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const att = await prisma.attachment.findUnique({ where: { id } });
  if (!att) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await unlink(path.join(UPLOAD_DIR, att.storedName)).catch(() => {
    // File already gone; still remove the row.
  });
  await prisma.attachment.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
