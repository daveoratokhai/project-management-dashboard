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
- [ ] Deploy to Vercel; wire env vars (decide: separate prod Supabase project vs reuse the dev one for the prototype).

## ⬜ Phase 3 — WhatsApp intake (text)

- [ ] `IntakeMessage` model (channel-agnostic) + `ProjectTask.source`/`reviewed`/`intakeMessageId`
- [ ] Twilio sandbox; webhook `POST /api/intake/whatsapp/webhook` with signature verification
- [ ] Claude (Haiku 4.5) triage: infer project + title + assignee, with a low-confidence fallback bucket
- [ ] Auto-create task flagged `reviewed = false`; TwiML confirmation reply
- [ ] Review surface: unreviewed badge + filter on the task list

## ⬜ Phase 4 — WhatsApp intake (voice) + hardening

- [ ] Voice notes: fetch OGG/Opus media → transcribe → same triage path
- [ ] Phone whitelist → `Person` mapping (with [[Authentication & Roles]])
- [ ] Confidence / fallback tuning
