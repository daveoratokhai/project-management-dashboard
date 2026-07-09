---
type: feature
status: done
phase: Phase 0.5
area: fullstack
updated: 2026-07-08
tags:
  - type/feature
  - area/frontend
---

# Projects Dashboard

> [!success] Done — Phase 0.5 / 1
> The main view at `/projects`: a DB-backed table of all projects with filtering and creation.

## What it does

- Lists all projects with columns: Project, Repository, Team, Tech, Created At, Contributors, Status.
- **Filter** by technology (text) and status; **toggle** which columns show.
- **New Project** button opens a create dialog with the **full field set**: Name, Team, Tech, Status (**required**; status defaults to **In Progress**), plus optional Repository, Start/End dates, Description, Tags, and Assignees. Optional fields can be left blank and filled in later via the [[Project Detail View]].
- Clicking a row navigates to that project's detail page.

## Where it lives

- `src/app/projects/page.tsx` — server; queries DB, maps rows to the table shape.
- `src/components/projects-view.tsx` — client; filters, column toggle, create dialog, `onRowClick` → `/projects/[id]`.
- `src/components/create-project-dialog.tsx` — client create form (all fields; receives `people` for the assignee picker, passed from the server page via `ProjectsView`).
- `src/components/ui/project-data-table.tsx` — the table (reusable; optional `onRowClick`).

> [!bug] Fixed 2026-07-08 — repository link hit-area
> The repo cell link used `flex` (full-width block), so clicking the empty space beside the text opened GitHub. Changed to `inline-flex w-fit` so the link wraps only its content; clicking elsewhere in the row now opens the project detail as intended.

## Related

[[Project Detail View]] · [[Technical Architecture]] · [[Design & Style]] · [[Roadmap]]
