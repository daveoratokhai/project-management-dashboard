import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

// POST /auth/signout - clear the session and return to the login page.
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  // 303 so the browser follows with a GET.
  return NextResponse.redirect(new URL("/login", req.url), { status: 303 });
}
