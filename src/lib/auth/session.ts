import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { atLeast, type Role } from "./roles";

export type SessionProfile = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string;
  role: Role;
};

// The signed-in user's profile (auth session + DB role), or null if not signed
// in / has no profile. Use in Server Components and Route Handlers.
export async function getSessionProfile(): Promise<SessionProfile | null> {
  // Auth not configured yet: behave as signed-out rather than crash.
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const p = await prisma.profile.findUnique({ where: { id: user.id } });
  if (!p) return null;
  return {
    id: p.id,
    email: p.email,
    name: p.name,
    avatarUrl: p.avatarUrl,
    role: p.role as Role,
  };
}

// Gate a Route Handler by minimum role. Returns `{ profile }` on success or
// `{ error }` (a 401/403 response) to return immediately:
//
//   const { profile, error } = await requireRole("Admin");
//   if (error) return error;
export async function requireRole(
  min: Role,
): Promise<
  | { profile: SessionProfile; error?: undefined }
  | { profile?: undefined; error: NextResponse }
> {
  const profile = await getSessionProfile();
  if (!profile) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if (!atLeast(profile.role, min)) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { profile };
}
