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

# Project Detail View

> [!success] Done — Phase 1
> Rich per-project page at `/projects/[id]` with full inline editing.

## What it does

- **Header:** title + Edit and Delete actions.
- **Meta grid:** Status (editable dropdown pill), Assignees (avatars + names), Date range, Tags, Description.
- **Edit dialog:** name, description, repository, team, tech, start/end dates, tags (pills), assignees (checkboxes).
- **Delete:** removes the project and cascades its [[Task List|tasks]] and [[Attachments|attachments]].
- Embeds the [[Task List]] and [[Attachments]] sections.

## Where it lives

- `src/app/projects/[id]/page.tsx` — server; loads project (+assignees/attachments/tasks) and people, `notFound()` on miss.
- `src/components/project-detail-view.tsx` — client; renders everything and wires all mutations (`router.refresh()` after each).
- `src/components/project-edit-dialog.tsx` — client edit form.

## Related

[[Projects Dashboard]] · [[Task List]] · [[Attachments]] · [[Technical Architecture]] · [[Roadmap]]
