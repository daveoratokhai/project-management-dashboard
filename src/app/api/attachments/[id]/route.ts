import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStorage } from "@/lib/storage";
import { requireRole } from "@/lib/auth/session";

export const runtime = "nodejs";

// DELETE /api/attachments/:id - remove the row and the file on disk.
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireRole("Member");
  if (error) return error;

  const { id } = await params;
  const att = await prisma.attachment.findUnique({ where: { id } });
  if (!att) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await getStorage().delete(att.storedName);
  await prisma.attachment.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
