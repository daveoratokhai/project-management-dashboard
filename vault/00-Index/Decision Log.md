---
title: Decision Log
tags:
  - log/decisions
updated: 2026-07-09
---

# 🧾 Decision Log

Dated decisions and the reasoning behind them. Newest first. Linked from [[Home]].

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
> Notion / Linear / Trello were rejected because the roadmap needs a bespoke WhatsApp + LLM intake pipeline that off-the-shelf tools don't provide cleanly. Accepted as intentional during idea pressure-test.

- **Stack:** [[Technical Architecture|Next.js 16 (App Router) + TypeScript + Tailwind v4]]. One codebase serves the UI now and API routes for WhatsApp webhooks / LLM calls later.
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
