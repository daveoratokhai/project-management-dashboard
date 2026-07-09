import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { UPLOAD_DIR } from "@/lib/uploads";

export const runtime = "nodejs";

// GET /api/attachments/:id/download - stream the stored file back.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const att = await prisma.attachment.findUnique({ where: { id } });
  if (!att) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const buf = await readFile(path.join(UPLOAD_DIR, att.storedName));
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": att.mimeType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(att.filename)}"`,
        "Content-Length": String(att.size),
      },
    });
  } catch {
    return NextResponse.json({ error: "File missing on disk" }, { status: 410 });
  }
}
