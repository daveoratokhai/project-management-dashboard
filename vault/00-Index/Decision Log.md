---
title: Decision Log
tags:
  - log/decisions
updated: 2026-07-09
---

# 🧾 Decision Log

Dated decisions and the reasoning behind them. Newest first. Linked from [[Home]].

## 2026-07-14

> [!note] Intake triage uses OpenAI, not Claude
> The [[Roadmap]] Phase 3 triage step calls **OpenAI `gpt-4o-mini`** (structured outputs via `zodResponseFormat`, `openai` SDK) instead of Claude Haiku. User preference (2026-07-14). The two are equivalent for this short classify-and-extract task; the swap is isolated to `src/lib/intake/triage.ts` (webhook, ingest, schema, review flow are provider-agnostic and unchanged). Env var is `OPENAI_API_KEY`; `@anthropic-ai/sdk` was removed. Note: the rest of the project's docs/model references remain Claude-oriented (cosmetic only). Reversible one-file change if we switch back. See [[Technical Architecture]].

## 2026-07-13

> [!note] WhatsApp intake: channel adapter over a generic intake core
> The [[Roadmap]] note-intake work gets its first concrete channel: WhatsApp. Kept generic on purpose (see the 2026-07-11 "intake generic" doc pass) so WhatsApp is one `channel` value on a shared intake + triage + review path, not bespoke plumbing. Decisions, all dated today:
> - **Transport: Twilio WhatsApp.** Legit (official API underneath) and running in minutes via the sandbox, versus Meta Cloud API's up-front bureaucracy or the ToS-violating unofficial libraries.
> - **Project routing: AI infers the project** from message text against the project list. Zero effort for senders; leans on the review step to catch misfiles.
> - **Senders: open to anyone (prototype only).** No phone whitelist yet; capture the raw number as source. Gate later when [[Authentication & Roles]] lands (map phone -> `Person`).
> - **Review flow: auto-create the task, flagged `reviewed = false`.** Task appears immediately, filterable as unreviewed, rather than sitting in a separate approval queue. Wrong AI guesses land in the tracker until cleaned up; acceptable for a trusted internal team.
> - **Bot replies to confirm each task** (free-form within Twilio's 24h window, no template). Sender sees a misroute early.
> - **Voice notes: phase 2.** Ship text intake first; add transcription (fetch OGG/Opus -> STT) into the same triage path afterward.
> - **Triage model: Claude Haiku 4.5** planned (cheap classification/extraction, fast enough to reply inside the webhook timeout).

> [!note] Hosting + infra stack locked (drives Phase 0)
> WhatsApp needs a public HTTPS webhook, which forces deploy + the [[Roadmap]] "team-ready" work earlier than planned.
> - **Host: Vercel.** Serverless, so no persistent SQLite file and no local `uploads/` disk survive; both must move.
> - **Database: Supabase Postgres.** Prod project + a separate free dev project (Postgres everywhere, one schema, no Docker). Prisma needs the pooled URL (`DATABASE_URL`, port 6543) at runtime and the direct URL (`DIRECT_URL`, port 5432) for migrations.
> - **Attachments: Supabase Storage** (S3-compatible), chosen over Vercel Blob to keep DB + files in one provider. `Project.tags` stays a JSON **string** on Postgres (no code churn to `parseTags`).

- **Prod reuses the single dev Supabase project (prototype).** Vercel and local dev share one Supabase project (DB + `attachments` bucket) for now, so local seeding/testing mutates live data. Accepted for an early prototype with no auth; split into a separate prod project before real use. See [[Roadmap]] Phase 2.
- **Storage abstraction shipped (Phase 0, code side).** `src/lib/storage/` now fronts attachment bytes: a `StorageAdapter` interface with `local` (on-disk `./uploads`, dev default) and `supabase` adapters, selected by `STORAGE_DRIVER`. The four attachment routes call `getStorage()` instead of `fs`. `storedName` doubles as the object key. Verified locally end-to-end (upload/download/delete). See [[Technical Architecture]] and [[Attachments]]. Supersedes part of the 2026-07-08 "local disk upload" decision (still the dev default; prod is Supabase).

## 2026-07-09

> [!note] Dark mode moved to a `.dark` class strategy + manual toggle
> Replaced the `prefers-color-scheme` media-query tokens with `@custom-variant dark` + a `.dark {}` block, managed by `next-themes` (Light / Dark / System, default System, persisted, no first-paint flash). This supersedes the 2026-07-07 "stays prefers-color-scheme-driven" decision, exactly as that entry anticipated. See [[Theme Toggle]].

- **Projects table status pill unified with `StatusBadge`.** The table had its own filled green/yellow/red badge while the detail page used outline pills; the table now renders the shared outline pill, so status looks identical everywhere. See [[Design & Style]].
- **Dialog forms remount instead of effect-reseeding.** eslint-config-next 16 enforces `react-hooks/set-state-in-effect`; form state now lives in child components inside `DialogContent` (fresh mount per open). Gotcha recorded in [[Technical Architecture]].
- **List page container aligned with detail** (`mx-auto w-full max-w-6xl` inside a `<main>` landmark); it previously used the wider `container` class, so list and detail rendered at different widths.

## 2026-07-08

> [!note] Editing now, roles later
> Build persistence + open editing first; add authentication + roles afterward. Every requested feature was blocked on projects being mock data, not on permissions, so this ships a usable dashboard fastest and role gating drops in cleanly later. Planned model: PM/Admin (projects), Member (tasks / status / attachments), Viewer (read-only). See [[Authentication & Roles]].

^editing-now-roles-later

> [!note] Attachments = local disk upload
> Uploaded files (PRDs, SOPs, etc.) are written to `./uploads` (gitignored) with metadata in the DB, and served through `/api/attachments/[id]/download` rather than statically, so access can be role-gated later. Upgradeable to S3/R2 without UI changes. See [[Attachments]].

- **Removed the kanban board.** App is projects-only; `/` redirects to `/projects`, nav is just the brand. The board's `Task` model, tasks API, and board components were deleted. See [[Roadmap]].
- **Projects moved from mock data to the database.** `src/lib/projects.ts` is now pure constants/types/helpers; all data is Prisma-backed. This unblocked all editing.

## 2026-07-07

> [!note] Build custom instead of buying
> Notion / Linear / Trello were rejected because the roadmap needs a bespoke note-intake + LLM pipeline that off-the-shelf tools don't provide cleanly. Accepted as intentional during idea pressure-test.

- **Stack:** [[Technical Architecture|Next.js 16 (App Router) + TypeScript + Tailwind v4]]. One codebase serves the UI now and API routes for note intake / LLM calls later.
- **Storage:** SQLite via Prisma for the MVP; portable to Postgres by swapping the datasource provider.
- **Pinned Prisma to v6.** Prisma 7 dropped `url`-in-schema for driver adapters + `prisma.config.ts`; too much friction for the MVP.
- **Adopted shadcn/ui** (new-york style, neutral base). Added `components.json`, `cn()`, and the full design-token set. See [[Design & Style]].
- **Tailwind v4 theme wiring:** shadcn tokens live in `globals.css` via `@theme inline` + CSS variables, NOT a `tailwind.config.js` (v4 has none). Key gotcha for pasting any shadcn component, see [[Technical Architecture]].
- **Dark mode stays `prefers-color-scheme`-driven**, not the `.dark` class shadcn defaults to. A manual toggle later means moving to a `.dark` class strategy.
- **`ProjectDataTable` made reusable:** row navigation added via an optional `onRowClick` prop rather than hardcoding the router.

## Idea pressure-test takeaways (2026-07-07)

> [!warning] Watch-outs carried forward
> - Chat is a poor structured-data entry format; AI auto-sort will misfile some percentage. A human-review step is assumed necessary ([[Roadmap]] Phase 4).
> - "Build vs buy" accepted as intentional given the custom intake roadmap.
