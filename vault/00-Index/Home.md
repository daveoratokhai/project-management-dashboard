---
title: Home
aliases:
  - Project Dashboard MOC
  - Start Here
tags:
  - moc
updated: 2026-07-09
---

# 🏠 Project Dashboard — Home

> [!abstract] What this is
> Internal project management dashboard. Teams browse projects in a table, open a rich detail view per project (status, assignees, timeline, tags, description, attachments, task list), and edit everything inline. Long-term vision: a lightweight note intake that an AI triages into the tracker.

## 🧭 Map of content

- [[Roadmap]] — phases, what's shipped, what's next
- [[Decision Log]] — dated decisions and the reasoning
- [[Technical Architecture]] — stack, data model, API, file map, gotchas
- [[Design & Style]] — design tokens and UI patterns

**Features:** [[Projects Dashboard]] · [[Project Detail View]] · [[Task List]] · [[Attachments]] · [[Theme Toggle]] · [[Authentication & Roles]]

## 📊 Feature status

![[Features.base]]

## ✅ Where things stand

> [!success] Shipped (2026-07-08)
> DB-backed projects dashboard with full editing: create / edit / delete projects, inline status, tags, assignees, task-list CRUD, and attachment upload / download / delete. Verified end-to-end. Details in [[Roadmap]].

> [!success] Shipped (2026-07-09)
> Cleanup + [[Theme Toggle]]: manual Light / Dark / System switch (class-based dark mode via next-themes), lint/typecheck clean, status pills unified across list and detail, UX polish. Verified in both themes via Playwright.

> [!todo] Next up
> [[Authentication & Roles]] — login plus PM / Member / Viewer roles. Editing is currently open to everyone by design, see [[Decision Log#^editing-now-roles-later]].

## ❓ Open questions

> [!question] Unresolved
> - Single-user (local SQLite) vs team-shared (hosted Postgres)? Deferred; revisit before team rollout.
> - Who reviews AI auto-sorted notes, and how are mis-sorts corrected?

## 🔮 Vision

Capture a quick note, an AI triages it, and it lands in the tracker as a structured project or task. The dashboard is the foundation; intake and AI are later phases in the [[Roadmap]].

> [!info] Vault conventions
> This vault is the project's source of truth. Notes use Obsidian Flavored Markdown: `[[wikilinks]]` between notes, frontmatter properties (`type`, `status`, `tags`, `updated`), and callouts for decisions / gotchas. Feature notes carry `type: feature` + `status` so the Features base above can index them. Update the relevant note whenever a decision is made or a feature ships.
