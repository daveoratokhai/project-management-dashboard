<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project Dashboard: Agent Guide

This file orients an AI coding assistant (or a new human contributor) so you can understand the project and continue from where the previous work stopped. Read it fully before making changes.

## What this is

An internal project management dashboard. Users browse projects in a filterable table, open a rich detail view per project (status, assignees, timeline, tags, description, attachments, and a task list with both List and Kanban views), and edit everything inline. Long-term vision: a lightweight note-intake surface that an AI triages into the tracker (not built yet).

## Current status (where we stopped)

Shipped and working end to end:
- Projects are fully database-backed (Prisma + SQLite). No mock data.
- Create / edit / delete projects with the full field set (name, team, tech, status, repository, start/end dates, tags, assignees, description).
- Project detail view with inline editing, editable status (dropdown on a pill).
- Task list with two views: List (table) and Kanban board. Dragging a card between columns changes its status; both views stay in sync.
- Attachments: upload to local disk, download, delete (deleting a project or attachment also removes the files on disk).
- Light / Dark theme toggle in the nav (one click flips; first load follows the OS).
- Code has been through a cleanup + UX pass; lint, typecheck, and build are clean.

There is NO authentication yet, so all editing is open to anyone. This is intended for a trusted internal environment for now.

### Next steps (the roadmap picks up here)

1. Authentication and roles (the planned next phase): login + a users table, then roles: PM/Admin (manage projects), Member (edit tasks / status / attachments), Viewer (read-only). Gate the API routes and hide UI actions by role. Link `Person` records to real user accounts. The most destructive action to gate first is project delete.
2. Team-ready: decide single-user vs shared; if shared, move SQLite to Postgres (change the datasource `provider` and `DATABASE_URL`). Deploy. Consider moving attachments from local disk to cloud storage (S3/R2).
3. AI intake: a lightweight note-capture surface, then LLM triage of freeform notes into structured records with a human-review step.

## Source of truth: the Obsidian vault

The `vault/` folder is the authoritative project memory, written in Obsidian Flavored Markdown. It is more detailed than this file. Read these first:
- `vault/00-Index/Home.md` (overview + map of content)
- `vault/00-Index/Roadmap.md` (phases, done and pending)
- `vault/00-Index/Decision Log.md` (why things are the way they are)
- `vault/00-Index/Technical Architecture.md` (stack, data model, file map, gotchas)
- `vault/00-Index/Design & Style.md` (design tokens, UI patterns)
- `vault/01-Features/*.md` (one note per feature)

Please KEEP THE VAULT UPDATED as you work: after a decision, a shipped feature, or a discovered gotcha, update the relevant note (and `vault/00-Index/Decision Log.md` / `Roadmap.md`). Use wikilinks (`[[Note Name]]`), YAML frontmatter, and callouts, matching the existing style. Feature notes carry `type: feature` + `status` so `vault/00-Index/Features.base` can index them.

## Tech stack

- Next.js 16 (App Router, Turbopack), React 19, TypeScript
- Tailwind CSS v4 (no `tailwind.config.js`; theme lives in CSS)
- Prisma 6 ORM with SQLite
- shadcn/ui (new-york, neutral) + Radix UI, lucide-react, framer-motion
- dnd-kit (Kanban drag and drop), next-themes (theming)

## Run it locally

```bash
npm install
cp .env.example .env
npx prisma migrate dev        # creates prisma/dev.db and the Prisma client
node prisma/seed.mjs          # optional: sample people + projects (idempotent)
npm run dev                   # http://localhost:3000  (root redirects to /projects)
```

Scripts: `npm run dev`, `npm run build`, `npm run start`, `npm run lint`. Typecheck with `npx tsc --noEmit`.

## Project structure

```
src/app/                     Routes + API
  page.tsx                   redirects / -> /projects
  layout.tsx                 root layout: nav (brand + theme toggle), ThemeProvider
  projects/page.tsx          SERVER: list; queries DB, renders <ProjectsView>
  projects/[id]/page.tsx     SERVER: detail; loads project + people, renders <ProjectDetailView>
  api/projects/...           POST create; PATCH/DELETE by id; POST [id]/tasks; POST [id]/attachments
  api/tasks/[id]/            PATCH/DELETE a task
  api/attachments/[id]/      DELETE; GET [id]/download
  api/people/                GET/POST people (used by assignee pickers)
src/components/              Feature components (client) + ui/ (shadcn primitives)
  projects-view.tsx          list: filters, column toggle, create dialog
  project-detail-view.tsx    the whole detail page + all editing interactions
  project-edit-dialog.tsx, create-project-dialog.tsx, task-dialog.tsx
  task-board.tsx             Kanban view of a project's tasks
  status-badge.tsx           shared status pill (tones: green/yellow/red/gray)
  theme-provider.tsx, theme-toggle.tsx
src/lib/
  projects.ts                PURE constants/types/helpers (no Prisma; client-safe): STATUS_*, TASK_*, TAGS, formatDate/formatSize, parseTags, attachmentType, Serialized* types
  prisma.ts                  singleton PrismaClient
  uploads.ts                 UPLOAD_DIR (= ./uploads)
prisma/                      schema.prisma, migrations/, seed.mjs
uploads/                     attachment files (gitignored; created at runtime)
vault/                       Obsidian vault (project docs; source of truth)
```

## Data model (prisma/schema.prisma)

- `Project`: name, repository, team, tech, status (`active` | `inProgress` | `onHold`), description, startDate/endDate (stored as `YYYY-MM-DD` strings), tags (JSON string of tag keys), timestamps. Relations: assignees (many-to-many `Person`), attachments (1-many), tasks (1-many).
- `Person`: name, avatarUrl, fallback; many-to-many with `Project`.
- `Attachment`: filename, storedName (name on disk), size, mimeType; belongs to `Project` (cascade delete). Bytes live under `./uploads`, not in the DB.
- `ProjectTask`: title, category, status (`Completed` | `In Progress` | `Pending`), dueDate, order; belongs to `Project` (cascade delete).

## Key patterns

- Server pages fetch the DB and pass serialized props to client components. Client components mutate via the API routes, then call `router.refresh()` to re-run the server component with fresh data. There is no client-side data store.
- Editable status pills: a status pill acts as a dropdown trigger, keeping the pill look while allowing edits (used for both project and task status).

## Conventions and gotchas (important; these have already bitten this project)

- DO NOT use em dashes anywhere you generate: not in code, comments, commit messages, or docs. Use commas, parentheses, or separate sentences. (The auto-generated block at the top of this file predates that rule; leave it as is.)
- Tailwind v4 has NO `tailwind.config.js`. Design tokens are defined in `src/app/globals.css` via CSS variables and `@theme inline`. A bare `border` class renders as opaque `currentColor` in v4, so always pair it with a token like `border-border` (the shadcn CLI emits bare `border` on DialogContent and SelectContent; patch those after adding a component).
- Page `<main>` containers under the flex-column `<body>` need `w-full` (with `mx-auto max-w-6xl`), or they shrink-to-fit their content and render at inconsistent widths.
- Dark mode is class-based (`.dark`) via next-themes. `globals.css` uses `@custom-variant dark (&:is(.dark *))` and a `.dark {}` token block; light tokens are in `:root`. Do not reintroduce the old `@media (prefers-color-scheme: dark)` token block.
- Route handler `params` is a `Promise` in Next 16: `const { id } = await params`.
- Stay on Prisma 6. Prisma 7 dropped the classic `url`-in-schema setup for driver adapters; do not upgrade without migrating that.
- `Figma` is not exported by this lucide-react version; a tinted `File` icon is used for `.fig` attachments.

## Verifying changes

Do not rely on the build alone. After a change: run `npm run lint` and `npx tsc --noEmit`, run `npm run build`, and drive the affected flow in the running app (create/edit/delete a project, task list + Kanban drag, attachment upload/download/delete, both light and dark themes). A dev server may already be running on port 3000; reuse it rather than starting a second one.

## Git

- Local storage is not committed: `.env`, `prisma/dev.db`, and `uploads/*` are gitignored. `.env.example` and the Prisma migrations are committed so a fresh clone can set up.
- Commit only when asked. Keep messages clear and end them with a `Co-Authored-By:` trailer for the assistant that made the change.
