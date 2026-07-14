import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Refreshes the auth session on every request, then gates access:
// - `/login`, `/auth/*` (callback, signout), and `/api/intake/*` (the Twilio
//   webhook, which must stay public) are always allowed.
// - Other `/api/*` routes return 401 JSON when signed out.
// - Everything else redirects to `/login` when signed out.
export async function middleware(request: NextRequest) {
  // Auth not configured yet (no Supabase public env vars): do not gate anything
  // and, importantly, do not crash, which would also break the public webhook.
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  const { response, user } = await updateSession(request);

  const isPublic =
    pathname.startsWith("/login") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/api/intake");

  if (isPublic) return response;

  if (!user) {
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    // Run on everything except Next internals and static asset files.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
