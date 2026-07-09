---
type: feature
status: done
phase: Phase 1
area: fullstack
updated: 2026-07-08
tags:
  - type/feature
  - area/frontend
---

# Task List

> [!success] Done — Phase 1
> Per-project task list inside the [[Project Detail View]]. Editable by everyone (not gated to the PM), see [[Decision Log#^editing-now-roles-later]].

## Two views: List + Board

A toggle in the section header switches between **List** and **Board** (Kanban) views of the same tasks.

- **List view** — table: No, Task, Category, Status, Due Date, Actions. Add task (dialog), inline status via dropdown pill, edit + delete per row.
- **Board view** — Kanban with three columns (To Do = Pending, In Progress, Done = Completed). Drag a card between columns to change its status.

> [!info] Views stay in sync
> Both views read the same `project.tasks` from the server. A drag on the board calls `PATCH /api/tasks/[id]` then `router.refresh()`, so the status change shows immediately in the List view too (and vice-versa). Drag changes status only; within-column ordering is not persisted.

## Where it lives

- `src/components/task-board.tsx` — **client** Kanban (dnd-kit: draggable cards + droppable columns; optimistic move + PATCH + refresh).
- `src/components/task-dialog.tsx` — client add/edit form.
- View toggle + list rendering live in `src/components/project-detail-view.tsx`.
- API: `POST /api/projects/[id]/tasks`, `PATCH|DELETE /api/tasks/[id]`.
- Model: `ProjectTask` (see [[Technical Architecture]]).

## Related

[[Project Detail View]] · [[Attachments]] · [[Technical Architecture]] · [[Roadmap]]
