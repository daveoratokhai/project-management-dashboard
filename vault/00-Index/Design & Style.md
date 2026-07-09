---
title: Design & Style
tags:
  - reference/design
updated: 2026-07-09
---

# 🎨 Design & Style

Design tokens and UI patterns. Linked from [[Home]]; implementation notes in [[Technical Architecture]].

## Design tokens (one system)

> [!success] Single theme
> The app now uses **shadcn semantic tokens** everywhere (`bg-card`, `text-muted-foreground`, `border-border`, `bg-primary`, etc.), neutral base, defined in `src/app/globals.css`. The old kanban's ad-hoc `slate`/`blue` colors are gone with the board, so the earlier "two color systems" split is resolved.

- **Dark mode:** class-based since 2026-07-09 (see [[Theme Toggle]]). `@custom-variant dark (&:is(.dark *))` in `globals.css`; dark tokens in a `.dark {}` block, light in `:root`. `next-themes` manages the class (Light / Dark / System, default System) via the nav toggle. Do NOT reintroduce a `@media (prefers-color-scheme: dark)` token block; it would fight the manual toggle.
- **Radius:** `--radius` scale; cards `rounded-lg`, pills `rounded-full`, dialogs `rounded-xl`.
- **Borders:** always use the `border-border` token (subtle: white/10% in dark, light gray in light) — never a bare `border` class, which Tailwind v4 renders as opaque `currentColor` (looks like a bright, heavy ring in dark mode). NOTE: the shadcn CLI generates components with bare `border` (e.g. `dialog.tsx` DialogContent, `select.tsx` SelectContent) — patch those to `border border-border` after adding. Fixed on the projects table, Dialog, and Select popover (2026-07-08).
- **Page containers need `w-full`:** `<body>` is `flex flex-col`, so page `<main>` is a flex item. A `mx-auto max-w-6xl` container WITHOUT `w-full` shrinks to fit its content (auto cross-axis margins override `stretch`), so a sparse page renders narrow and a data-rich page renders wide. Always use `mx-auto w-full max-w-6xl`. Fixed on the detail page 2026-07-08.
- **Fonts:** scaffold defaults (Geist sans + mono). No brand font yet.
- **Brand color:** none yet — `primary` is near-black neutral. Set a hue by editing `--primary` in `globals.css`.

## Layout

- Centered `max-w-6xl` main across list and detail.
- **List ([[Projects Dashboard]]):** header (title + "New Project") → filter row (tech search, status filter, column toggle) → data table.
- **Detail ([[Project Detail View]]):** back link → title + Edit/Delete → 3-column meta grid (Status / Assignee / Date, then Tags / Description spanning) → Attachments → Task List.

## Component patterns

- **Status pills** ([[Technical Architecture|StatusBadge]]): tone-colored outline pills, green (active/completed), yellow (in progress), red (on hold), gray (pending). Optional leading dot. Rendered as dropdown triggers where editable. Since 2026-07-09 the projects table uses the same `StatusBadge` (the old filled green/yellow/red badge there is gone), so list and detail match.
- **Tag pills:** filled, per-tag color from the `TAGS` palette in `src/lib/projects.ts`.
- **Row/table:** hover highlight; clickable rows use `cursor-pointer`; row actions (edit/delete) reveal on hover (`opacity-0 group-hover:opacity-100`).
- **Attachment cards:** icon tinted by file type, filename + size; delete "x" on hover; dashed "+" card triggers the file picker. See [[Attachments]].
- **Dialogs:** shadcn Dialog for create/edit forms; Radix Select for status; date inputs for timelines; tag pills + assignee checkboxes in the project edit form.
- **Motion:** table rows animate in with a small staggered fade/slide (framer-motion).
