import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";
import { isRole } from "@/lib/auth/roles";

export const runtime = "nodejs";

// PATCH /api/team/:id - change a user's role. Admin only.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { profile, error } = await requireRole("Admin");
  if (error) return error;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!isRole(body?.role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  // Guard against self-lockout: an admin can't drop their own admin role.
  if (id === profile.id && body.role !== "Admin") {
    return NextResponse.json(
      { error: "You can't change your own admin role. Ask another admin." },
      { status: 400 },
    );
  }

  try {
    const updated = await prisma.profile.update({
      where: { id },
      data: { role: body.role },
    });
    return NextResponse.json({ id: updated.id, role: updated.role });
  } catch {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
}
