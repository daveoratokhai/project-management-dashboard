// Who may sign in, and who is an admin, driven by env vars (server-only).
//
//   AUTH_ALLOWED_EMAILS - comma-separated emails allowed to sign in.
//   AUTH_ADMIN_EMAILS   - comma-separated emails that become Admin on first
//                          login (also implicitly allowed).
//
// Locked by default: if neither var is set, nobody is allowed in.

function parseList(v: string | undefined): string[] {
  return (v ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function isAllowedEmail(email: string): boolean {
  const e = email.toLowerCase();
  const allowed = parseList(process.env.AUTH_ALLOWED_EMAILS);
  const admins = parseList(process.env.AUTH_ADMIN_EMAILS);
  return allowed.includes(e) || admins.includes(e);
}

export function isAdminEmail(email: string): boolean {
  return parseList(process.env.AUTH_ADMIN_EMAILS).includes(email.toLowerCase());
}
