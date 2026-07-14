import Link from "next/link";
import { getSessionProfile } from "@/lib/auth/session";

// Server component: shows the signed-in user, their role, an Admin-only Team
// link, and a sign-out button. Renders nothing when signed out (e.g. /login).
export async function NavUser() {
  const profile = await getSessionProfile();
  if (!profile) return null;

  return (
    <div className="flex items-center gap-3 text-sm">
      {profile.role === "Admin" && (
        <Link
          href="/team"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          Team
        </Link>
      )}
      <span className="hidden text-muted-foreground sm:inline">
        {profile.email}
      </span>
      <span className="rounded-full border border-border px-2 py-0.5 text-xs font-medium text-muted-foreground">
        {profile.role}
      </span>
      <form action="/auth/signout" method="post">
        <button
          type="submit"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
