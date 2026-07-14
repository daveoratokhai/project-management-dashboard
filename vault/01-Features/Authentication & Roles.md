---
type: feature
status: in-progress
phase: Phase Auth
area: fullstack
updated: 2026-07-14
tags:
  - type/feature
  - area/backend
---

# Authentication & Roles

> [!info] Built 2026-07-14 — pending config
> Supabase Auth + Google sign-in, gated by an explicit email allowlist. Code is done and builds; needs the Google OAuth app + Supabase provider + env vars before it's live. See [[Decision Log]] 2026-07-14 and [[Roadmap]] Phase Auth.

## Model

| Role | Can do |
| --- | --- |
| Admin (PM) | Everything: create/edit/**delete** projects, manage people + roles |
| Member | Edit tasks, status, attachments, review/approve/reassign intake |
| Viewer | Read-only |

Bootstrapping: `AUTH_ADMIN_EMAILS` -> Admin on first login; other allowlisted users default to Viewer until an Admin promotes them on `/team`.

## Files

- `src/lib/auth/roles.ts` — roles, `atLeast`, `can` (client-safe).
- `src/lib/auth/allowlist.ts` — `AUTH_ALLOWED_EMAILS` / `AUTH_ADMIN_EMAILS` (locked by default).
- `src/lib/auth/session.ts` — `getSessionProfile()`, `requireRole(min)` for route gating.
- `src/lib/supabase/{server,client,middleware}.ts` — `@supabase/ssr` clients.
- `src/middleware.ts` — session refresh + gate; no-ops if Supabase env unset; exempts `/login`, `/auth`, `/api/intake` (webhook stays public).
- `src/app/login/page.tsx` + `login-button.tsx`, `src/app/auth/callback/route.ts`, `src/app/auth/signout/route.ts`.
- `src/app/team/page.tsx` + `team-table.tsx` + `src/app/api/team/[id]/route.ts` (Admin role management).
- `Profile` model in `prisma/schema.prisma` (id = Supabase auth uid, `role`, optional `personId`).

## Env

`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `AUTH_ALLOWED_EMAILS`, `AUTH_ADMIN_EMAILS`.

## Not done

- [ ] Link `Person` records to accounts (schema supports it via `Profile.personId`; no UI yet).
- [ ] Additional login methods (only Google for now).

## Related

[[Projects Dashboard]] · [[Attachments]] · [[Decision Log]] · [[Roadmap]]
