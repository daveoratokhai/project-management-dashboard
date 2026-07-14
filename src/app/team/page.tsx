import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionProfile } from "@/lib/auth/session";
import { TeamTable } from "@/components/team-table";

export const dynamic = "force-dynamic";

// Admin-only page for managing user roles. Middleware guarantees a session;
// this guards the Admin requirement (non-admins are bounced to /projects).
export default async function TeamPage() {
  const profile = await getSessionProfile();
  if (!profile || profile.role !== "Admin") redirect("/projects");

  const profiles = await prisma.profile.findMany({
    orderBy: [{ role: "asc" }, { email: "asc" }],
  });
  const members = profiles.map((p) => ({
    id: p.id,
    email: p.email,
    name: p.name,
    role: p.role,
  }));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 md:px-6">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Team</h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">
        Everyone who has signed in. Admins manage projects, Members edit tasks
        and attachments, Viewers are read-only. New sign-ins start as Viewer.
      </p>
      <TeamTable members={members} currentUserId={profile.id} />
    </main>
  );
}
