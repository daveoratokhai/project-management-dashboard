import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { isAllowedEmail, isAdminEmail } from "@/lib/auth/allowlist";

export const runtime = "nodejs";

// OAuth return: exchange the code for a session, enforce the email allowlist,
// upsert the Profile (Admin for AUTH_ADMIN_EMAILS on first login, else Viewer),
// then land the user in the app.
export async function GET(req: NextRequest) {
  const { origin, searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(`${origin}/login?error=auth`);
    }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  const email = user.email.toLowerCase();
  if (!isAllowedEmail(email)) {
    // Authenticated with Google, but not on the allowlist: sign back out.
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/login?error=not-allowed`);
  }

  const existing = await prisma.profile.findUnique({ where: { id: user.id } });
  const role = existing?.role ?? (isAdminEmail(email) ? "Admin" : "Viewer");
  const name =
    (user.user_metadata?.full_name as string | undefined) ?? existing?.name ?? "";
  const avatarUrl =
    (user.user_metadata?.avatar_url as string | undefined) ??
    existing?.avatarUrl ??
    "";

  await prisma.profile.upsert({
    where: { id: user.id },
    create: { id: user.id, email, role, name, avatarUrl },
    update: { email, name, avatarUrl },
  });

  return NextResponse.redirect(`${origin}/projects`);
}
