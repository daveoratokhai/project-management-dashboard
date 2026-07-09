# Project Dashboard

An internal project management dashboard. Browse projects in a filterable table, open a rich detail view per project (status, assignees, timeline, tags, description, attachments, and a task list with both List and Kanban views), and edit everything inline.

Built with Next.js (App Router), TypeScript, Tailwind CSS v4, Prisma + SQLite, and shadcn/ui.

## Features

- Projects table with technology and status filters plus column toggles
- Create, edit, and delete projects with the full field set (name, team, tech, status, repository, dates, tags, assignees, description)
- Per-project detail view: editable status, assignees, start/end dates, tags, and description
- Attachments: upload (stored on local disk), download, and delete
- Task list with two views: a List and a Kanban board (drag a card to change its status; both views stay in sync)
- Light / Dark theme toggle (follows the OS on first load, then remembers your choice)
- Persistence via Prisma + SQLite

## Tech stack

- Next.js 16 (App Router, Turbopack), React 19, TypeScript
- Tailwind CSS v4, shadcn/ui, Radix UI, lucide-react, framer-motion
- Prisma 6 ORM with SQLite
- dnd-kit (Kanban drag and drop), next-themes (theming)

## Getting started

### Prerequisites

- Node.js 20 or newer (developed on Node 24)

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Create your environment file
cp .env.example .env

# 3. Create the database and generate the Prisma client
npx prisma migrate dev

# 4. (Optional) Seed sample people and projects
node prisma/seed.mjs

# 5. Start the dev server
npm run dev
```

Open http://localhost:3000 (the root redirects to `/projects`).

### Scripts

- `npm run dev` — start the development server
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — run ESLint
- `node prisma/seed.mjs` — seed sample data (idempotent; skips if projects already exist)

## Project structure

```
src/app          Routes: projects list, project detail, and API routes
src/components    Feature components; src/components/ui holds shadcn primitives
src/lib           Shared helpers (projects vocabulary, Prisma client, uploads)
prisma            Schema, migrations, and seed script
uploads           Uploaded attachment files (gitignored, created at runtime)
vault             Obsidian vault: the project's source-of-truth documentation
```

## Data model

A `Project` (tags stored as JSON, dates as strings) has many `ProjectTask`s, many `Attachment`s, and a many-to-many relation to `Person` (assignees). See `prisma/schema.prisma` and `vault/00-Index/Technical Architecture.md` for details.

## Documentation

Architecture notes, design decisions, and the roadmap live in the Obsidian vault under `vault/`. Open that folder in Obsidian for the full picture: it uses wikilinks, callouts, and a Features base to track the build.

## Roadmap

Next up is authentication and roles (PM / Member / Viewer), followed by team deployment (moving SQLite to Postgres) and an AI note-intake layer. See `vault/00-Index/Roadmap.md`.

## Notes

- Storage is local for the MVP: SQLite (`prisma/dev.db`) and attachment files on disk (`uploads/`). Both are gitignored; the database is created by `prisma migrate`.
- There is no authentication yet, so all editing is open. This is intended for a trusted internal environment until the auth phase lands.
