---
title: Roadmap
tags:
  - planning/roadmap
updated: 2026-07-09
---

# 🗺️ Roadmap

Status legend: ✅ done · 🔄 in progress · ⬜ not started. Linked from [[Home]]; per-feature detail in the feature notes linked below.

## ✅ Phase 0 — Kanban MVP (2026-07-07, since removed)

Shipped a working kanban board, then removed it (see [[Decision Log]]) when the direction narrowed to a projects-only dashboard. Kept here for history.

- [x] Next.js + TS + Tailwind scaffold
- [x] SQLite + Prisma persistence
- [x] Board with drag-and-drop, card CRUD

## ✅ Phase 0.5 — shadcn foundation + Projects view (2026-07-07)

- [x] shadcn/ui set up for Tailwind v4 (tokens in `globals.css`, `cn` util, `components.json`)
- [x] UI primitives: button, badge, input, table, avatar, dropdown-menu
- [x] [[Projects Dashboard]] — `ProjectDataTable` with filters, column toggle, row animations
- [x] [[Project Detail View]] — clickable rows → `/projects/[id]`

## ✅ Phase 1 — Persistence + editing (2026-07-08)

- [x] Board view removed; app is projects-only (`/` → `/projects`)
- [x] Projects / people / tasks / attachments DB-backed (Prisma/SQLite); mock data removed
- [x] Create project; edit all fields, status, tags, assignees
- [x] [[Task List]]: add / edit / delete, inline status (open to everyone)
- [x] [[Task List]] Kanban view — list/board toggle; drag a card to change status (syncs both views)
- [x] [[Attachments]]: upload to local disk, download, delete
- [x] Delete project (cascades tasks + attachments)
- [x] Verified end-to-end via API

## ✅ Phase 1.1: Cleanup + theme toggle (2026-07-09)

- [x] [[Theme Toggle]]: manual Light / Dark / System switch in the nav (next-themes, class-based dark mode)
- [x] Code review pass: lint + typecheck clean, dialog forms remount instead of effect-reseeding, dead code removed
- [x] UX polish: status pill unified on the list ([[Design & Style]]), list/detail widths aligned, upload errors surfaced, better empty states
- [x] Verified end-to-end in both themes via Playwright

## ⬜ Phase Auth — Accounts & roles (NEXT)

See [[Authentication & Roles]].

- [ ] Authentication (login) + users table
- [ ] Roles: PM/Admin (projects), Member (tasks / status / attachments), Viewer (read-only)
- [ ] Gate API routes + hide UI actions by role
- [ ] Link `Person` records to user accounts

## 🔄 Phase 2 — Team-ready (Phase 0 of WhatsApp intake; started 2026-07-13)

Pulled forward because WhatsApp intake needs a public webhook, so deploy + Postgres + cloud storage all land here. Stack: **Vercel** host, **Supabase** Postgres + Storage (see [[Decision Log]] 2026-07-13).

- [x] Storage abstraction: `StorageAdapter` + local/supabase adapters, `STORAGE_DRIVER` (`src/lib/storage/`); attachment routes off `fs`. Verified locally.
- [x] SQLite → Supabase Postgres: datasource flipped (`postgresql` + `directUrl`), migration history reset to a fresh Postgres `init`, re-seeded. Verified against the Supabase dev project.
- [x] `STORAGE_DRIVER=supabase` + private `attachments` bucket (25 MB cap). Upload/download/delete verified against Supabase Storage end-to-end.
- [x] Deploy to Vercel; env vars wired. Live at `project-management-dashboard-liart.vercel.app` (Vercel Authentication disabled; prod reuses the one Supabase project). Seed data cleared to an empty slate (5 seed `Person` rows kept). **Phase 0 / team-ready complete.**

## 🔄 Phase 3 — WhatsApp intake (text) (started 2026-07-14)

- [x] `IntakeMessage` model (channel-agnostic) + `ProjectTask.source`/`reviewed`/`intakeMessageId` (migration `intake_messages`, applied to live DB)
- [x] Webhook `POST /api/intake/whatsapp/webhook`: Twilio signature verification, TwiML reply. Verified locally (bad sig -> 403, good sig -> 200 TwiML, triage failure -> graceful apology).
- [x] Triage (`src/lib/intake/triage.ts`): OpenAI `gpt-4o-mini` structured outputs -> `{projectId|null, title, category, confidence}`; low confidence / no match -> `null`. (Switched from Claude Haiku to OpenAI per user preference, 2026-07-14.)
- [x] Ingest (`src/lib/intake/ingest.ts`): auto-creates task flagged `reviewed = false`, links `intakeMessageId`; unrouted notes go to an auto-created "Inbox (unsorted)" project. Assignee left empty (senders anonymous).
- [x] Triage accuracy test: 6 sample notes routed correctly (bugs->right service, feature->marketing, vague->Inbox null) with sensible titles/categories/confidence. Verified via a temporary dev route against real OpenAI, 2026-07-14.
- [x] Review surface: amber `UnreviewedBadge` (with source) on unreviewed tasks in both List + Board, an "N to review" filter chip, and a one-click approve (`PATCH reviewed:true`). `SerializedTask` gained `source`/`reviewed`; task PATCH route accepts `reviewed`. Verified end-to-end (badge shows only on AI tasks, approve flips the flag, badge clears).
- [x] Reassign a task to another project (fix AI misroutes): Project `<Select>` in the edit-task dialog; task PATCH accepts `projectId` (validates target, appends to its order). Detail page passes the full project list down. Verified (move -> 200, invalid -> 400).
- [ ] Deploy + point the Twilio WhatsApp Sandbox webhook at the live URL; end-to-end test by texting the sandbox. (Needs `OPENAI_API_KEY` + `TWILIO_AUTH_TOKEN` in Vercel.)

## ⬜ Phase 4 — WhatsApp intake (voice) + hardening

- [ ] Voice notes: fetch OGG/Opus media → transcribe → same triage path
- [ ] Phone whitelist → `Person` mapping (with [[Authentication & Roles]])
- [ ] Confidence / fallback tuning
