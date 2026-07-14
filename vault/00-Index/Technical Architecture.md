---
title: Technical Architecture
tags:
  - reference/architecture
updated: 2026-07-09
---

# 🏗️ Technical Architecture

Stack, data model, API, file map, and gotchas. Linked from [[Home]]. Design details in [[Design & Style]].

## Stack

- Next.js 16.2 (App Router, Turbopack), React 19, TypeScript
- Tailwind CSS v4
- Prisma 6 ORM + SQLite (`prisma/dev.db`) — Postgres (Supabase) cutover in progress, see [[Roadmap]] and [[Decision Log]] 2026-07-13
- shadcn/ui (new-york, neutral) + Radix primitives, framer-motion, class-variance-authority, lucide-react, tw-animate-css, clsx + tailwind-merge
- next-themes for the manual Light / Dark / System toggle (see [[Theme Toggle]])

## Data model (Prisma/SQLite)

- **`Project`** — name, repository, team, tech, status (`active` | `inProgress` | `onHold`), description, startDate/endDate (`YYYY-MM-DD` strings), tags (JSON string of tag keys), timestamps. Relations: assignees (M-N `Person`), attachments (1-M), tasks (1-M).
- **`Person`** — name, avatarUrl, fallback; M-N with `Project` ("ProjectAssignees").
- **`Attachment`** — filename, storedName, size, mimeType; belongs to `Project` (cascade delete). See [[Attachments]].
- **`ProjectTask`** — title, category, status (`Completed` | `In Progress` | `Pending`), dueDate, order; belongs to `Project` (cascade delete). See [[Task List]].

> [!warning] SQLite has no JSON type
> `Project.tags` is stored as a JSON **string** and parsed via `parseTags()` in `src/lib/projects.ts`. Dates are stored as display-friendly `YYYY-MM-DD` strings and formatted with `formatDate()` (parsed manually to avoid timezone shifts).

## API routes (`src/app/api`)

- `POST /api/projects` · `PATCH|DELETE /api/projects/[id]`
- `POST /api/projects/[id]/tasks` · `PATCH|DELETE /api/tasks/[id]`
- `POST /api/projects/[id]/attachments` (multipart) · `GET /api/attachments/[id]/download` · `DELETE /api/attachments/[id]`
- `GET|POST /api/people`

## File map

- `prisma/schema.prisma` — the data model above.
- `prisma/seed.mjs` — idempotent (skips if projects exist). Seeds 5 people + 4 projects. Run `node prisma/seed.mjs`.
- `src/lib/prisma.ts` — singleton PrismaClient (hot-reload safe).
- `src/lib/projects.ts` — **pure** constants/types/helpers (no Prisma; safe for client + server): `STATUS_*`, `TASK_*`, `TAGS`, `formatDate`/`formatSize`, `parseTags`, `attachmentType`, `Serialized*` prop types.
- `src/lib/uploads.ts` — `UPLOAD_DIR` (= `./uploads`); used by the local storage adapter.
- `src/lib/intake/` — WhatsApp/AI intake (added 2026-07-14). `triage.ts` (OpenAI `gpt-4o-mini` via the `openai` SDK, structured outputs with `zodResponseFormat`, returns `{projectId|null, title, category, confidence}`), `ingest.ts` (records `IntakeMessage`, creates the `reviewed=false` task, routes low-confidence notes to the auto-created "Inbox (unsorted)" project). Webhook: `src/app/api/intake/whatsapp/webhook/route.ts` (Twilio form parse, `twilio.validateRequest` signature check via the reconstructed `x-forwarded-proto`+`host` URL, TwiML reply). Env: `OPENAI_API_KEY`, `TWILIO_AUTH_TOKEN`.
- `src/lib/storage/` — attachment-bytes abstraction (added 2026-07-13). `types.ts` (`StorageAdapter`: `put`/`get`/`delete`), `local.ts` (on-disk `./uploads`, dev default), `supabase.ts` (Supabase Storage, prod), `index.ts` (`getStorage()`, picks adapter from `STORAGE_DRIVER`). The four attachment routes call `getStorage()`; `Attachment.storedName` is the object key. See [[Attachments]].
- `src/app/layout.tsx` — root layout; nav has the brand (links to `/projects`) and the theme toggle. `suppressHydrationWarning` on `<html>` is required by next-themes.
- `src/components/theme-provider.tsx` / `theme-toggle.tsx` — **client**; next-themes wrapper + the nav Light / Dark / System control. See [[Theme Toggle]].
- `src/app/page.tsx` — redirects `/` → `/projects`.
- `src/app/projects/page.tsx` — **server**; queries DB, maps to table shape, renders `ProjectsView`.
- `src/app/projects/[id]/page.tsx` — **server**; loads project + people, `notFound()` if missing, renders `ProjectDetailView`.
- `src/components/projects-view.tsx` — **client**; filters, column toggle, create dialog, table with `onRowClick`. See [[Projects Dashboard]].
- `src/components/project-detail-view.tsx` — **client**; the whole detail + all editing. See [[Project Detail View]].
- `src/components/project-edit-dialog.tsx`, `create-project-dialog.tsx`, `task-dialog.tsx` — **client** forms.
- `src/components/task-board.tsx` — **client** Kanban view of a project's tasks (dnd-kit). See [[Task List]].
- `src/components/status-badge.tsx` — shared presentational pill (tone green/yellow/red/gray).
- `src/components/ui/*` — shadcn primitives: button, badge, input, table, avatar, dropdown-menu, dialog, select, label, textarea, project-data-table.

## Key patterns

> [!tip] Server → client → API → refresh
> Server pages fetch the DB and pass serialized props to client components. Client components mutate via the API routes, then call `router.refresh()` to re-run the server component with fresh data. No client-side data store.

- **Editable status pills:** `StatusDropdown` wraps a [[Design & Style|StatusBadge]] as a dropdown trigger, keeping the pill look while making status editable (used for project + task status).
- **Reusable table:** `ProjectDataTable` takes an optional `onRowClick`; the repository link uses `stopPropagation` so it doesn't trigger row navigation.

## shadcn/ui on Tailwind v4

> [!danger] The #1 gotcha
> Tailwind v4 has **no `tailwind.config.js`**. shadcn tokens live in `src/app/globals.css` via `@theme inline` + CSS variables. Without that token set, semantic classes (`bg-card`, `text-muted-foreground`, `border-border`) render as no-op unstyled boxes. See [[Design & Style]].

- `tw-animate-css` is imported for the dropdown's `animate-in` / `zoom-in-95` / `slide-in-*` classes (v4 replacement for `tailwindcss-animate`).
- Adding components via `npx shadcn@latest add <x>` works, but its Radix deps were **not** auto-saved to `package.json` — had to `npm install` them manually.

## Other gotchas

- Prisma 7 is incompatible with the classic `url`-in-schema setup — stay on v6.
- Route handler `params` is a `Promise` in Next 16 (`await params`).
- `Figma` is not exported by this lucide-react version — used a tinted `File` icon for `.fig` attachments.
- **Tailwind v4 default border color is `currentColor`, not gray.** A bare `border` / `border-b` (no color) renders as the opaque text color — harsh in dark mode. Always pair with a token, e.g. `border-border`. This bit the projects table borders (fixed 2026-07-08); see [[Design & Style]].
- **`react-hooks/set-state-in-effect` (eslint-config-next 16) forbids seeding form state in a `useEffect(open)`.** Pattern used instead: put the form state in a child component rendered inside `DialogContent`; Radix unmounts it on close, so each open mounts fresh state from props (see `task-dialog.tsx`, `project-edit-dialog.tsx`). For prop-driven re-sync (Kanban columns), adjust state during render behind a `prevTasks !== tasks` check (`task-board.tsx`).
- `.env`, `prisma/dev.db`, and `uploads/*` are gitignored.
- **Prisma on Vercel:** the client is not regenerated on Vercel's cached installs, so `package.json` has `"postinstall": "prisma generate"`. Without it, deploys fail at runtime with an outdated-client error. `DATABASE_URL` uses the Supabase transaction pooler (6543, `pgbouncer=true`) which is correct for serverless; `DIRECT_URL` (5432) is migrate-only. Migrations are applied out-of-band (`prisma migrate deploy` against the DB), not during the Vercel build.

## Commands

```bash
npm run dev              # http://localhost:3000
npm run build
npx prisma migrate dev
node prisma/seed.mjs
```

## Future hooks (AI intake layer)

- Add an intake table (or status) for un-triaged notes.
- Note-capture endpoint → new API route under `src/app/api/`.
- LLM sort → server-side Claude call that assigns fields; keep a human-review queue. See [[Roadmap]] Phases 3–4.
