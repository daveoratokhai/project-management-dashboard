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

## ⬜ Phase 2 — Team-ready

- [ ] Decide single-user vs shared; if shared, move SQLite → Postgres
- [ ] Deploy
- [ ] Upgrade [[Attachments]] to cloud storage (S3/R2) if needed

## ⬜ Phase 3 — Note intake

- [ ] Lightweight note-capture UI (inbox / intake table)

## ⬜ Phase 4 — AI auto-sort

- [ ] LLM triage of freeform notes into structured records
- [ ] Human-review step for mis-sorts
- [ ] Confidence / fallback handling
