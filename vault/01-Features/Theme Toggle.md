---
type: feature
status: done
phase: Phase 1.1
area: frontend
updated: 2026-07-09
tags:
  - type/feature
  - area/frontend
---

# Theme Toggle

> [!success] Done (2026-07-09)
> Manual Light / Dark / System theme switch in the top nav. Defaults to System.

## What it does

- Sun/moon icon button in the nav (aria-label "Toggle theme") opens a dropdown with Light, Dark, and System options; the active choice shows a check.
- Choice persists in `localStorage` (`theme` key) and survives reloads.
- No flash of the wrong theme: `next-themes` injects a pre-hydration script that sets the `.dark` class on `<html>` before first paint (`suppressHydrationWarning` on `<html>` covers the attribute mismatch).

## How it works

- **Class-based dark mode.** `src/app/globals.css` declares `@custom-variant dark (&:is(.dark *))`; dark token values live in a `.dark {}` block (light stays in `:root`). The old `@media (prefers-color-scheme: dark)` block is gone, so every `dark:` utility now follows the class, and System mode is handled by `next-themes` reading the OS preference.
- `src/components/theme-provider.tsx` is a thin client wrapper around `next-themes` `ThemeProvider` (`attribute="class"`, `defaultTheme="system"`, `enableSystem`), mounted in `src/app/layout.tsx`.
- `src/components/theme-toggle.tsx` renders the nav control. The trigger icon flips via CSS (`dark:hidden` / `dark:block`), so it never mismatches during hydration.

## Verified

Both themes exercised end to end via Playwright (list, detail, dialogs, Kanban): `.dark` class applied/removed, tokens flip, persistence across reload, System default.

## Related

[[Design & Style]] · [[Technical Architecture]] · [[Decision Log]] · [[Roadmap]]
