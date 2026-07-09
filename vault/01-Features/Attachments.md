---
type: feature
status: done
phase: Phase 1
area: fullstack
updated: 2026-07-08
tags:
  - type/feature
  - area/backend
---

# Attachments

> [!success] Done — Phase 1
> Real file upload per project (PRDs, SOPs, mockups, etc.) inside the [[Project Detail View]].

## What it does

- **Upload:** the "+" card opens the file picker; files upload (multiple supported, 25 MB cap each).
- **Download:** click a file card; "Download All" grabs everything.
- **Delete:** "x" on hover removes the row and the file on disk.

## Storage decision

> [!info] Local disk, served via API
> Files are written to `./uploads` (gitignored) with metadata in the DB, and served through `/api/attachments/[id]/download` rather than statically — so access can be role-gated once [[Authentication & Roles]] lands. Upgradeable to S3/R2 without UI changes. See [[Decision Log]].

## Where it lives

- `src/lib/uploads.ts` — `UPLOAD_DIR`.
- API: `POST /api/projects/[id]/attachments`, `GET /api/attachments/[id]/download`, `DELETE /api/attachments/[id]` (all `runtime = "nodejs"`).
- UI in `src/components/project-detail-view.tsx` (hidden file input + cards).
- Model: `Attachment` (see [[Technical Architecture]]).

## Related

[[Project Detail View]] · [[Authentication & Roles]] · [[Technical Architecture]] · [[Roadmap]]
