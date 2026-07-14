// Role model and permission helpers. Pure and client-safe (no Prisma, no
// server-only imports) so both API routes and UI can gate on the same rules.

export const ROLES = ["Admin", "Member", "Viewer"] as const;
export type Role = (typeof ROLES)[number];

// Higher rank = more privilege. `Admin` (PM) manages projects and roles;
// `Member` edits tasks/status/attachments and reviews intake; `Viewer` reads.
const RANK: Record<Role, number> = { Viewer: 0, Member: 1, Admin: 2 };

export function isRole(v: unknown): v is Role {
  return typeof v === "string" && (ROLES as readonly string[]).includes(v);
}

export function atLeast(role: Role, min: Role): boolean {
  return RANK[role] >= RANK[min];
}

// Capability checks used by both route gating and UI visibility.
export const can = {
  // Create / edit / delete projects, and manage people + roles.
  manageProjects: (role: Role) => role === "Admin",
  manageRoles: (role: Role) => role === "Admin",
  // Edit tasks, change status, upload/delete attachments, review/reassign intake.
  editTasks: (role: Role) => atLeast(role, "Member"),
};
