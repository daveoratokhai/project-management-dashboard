---
type: feature
status: planned
phase: Phase Auth
area: fullstack
updated: 2026-07-08
tags:
  - type/feature
  - area/backend
---

# Authentication & Roles

> [!todo] Planned — next phase
> Add login + role-based permissions. Editing is currently open to everyone by design, see [[Decision Log#^editing-now-roles-later]].

## Planned model

| Role | Can do |
| --- | --- |
| PM / Admin | Add, edit, delete projects |
| Member | Edit tasks, change status, upload attachments |
| Viewer | Read-only |

## Scope

- [ ] Authentication (login) + users table
- [ ] Role checks on the API routes (see [[Technical Architecture]])
- [ ] Hide UI actions by role (create, edit, delete, upload)
- [ ] Link `Person` records to user accounts

> [!warning] First thing to gate
> Project **delete** is the most destructive action and is currently always visible. Restrict it to PM/Admin first.

## Related

[[Projects Dashboard]] · [[Attachments]] · [[Decision Log]] · [[Roadmap]]
