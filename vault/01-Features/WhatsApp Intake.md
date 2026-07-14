---
type: feature
status: done
phase: Phase 3
area: fullstack
updated: 2026-07-14
tags:
  - type/feature
  - area/backend
  - area/ai
---

# WhatsApp Intake

> [!success] Done, live end-to-end — Phase 3 (2026-07-14)
> Team members text a WhatsApp note; an LLM triages it into a task on the right project, flagged for human review. Verified from a real phone against the deployed app. See [[Roadmap]] Phase 3.

## Flow

```
WhatsApp msg -> Twilio -> POST /api/intake/whatsapp/webhook
  -> verify X-Twilio-Signature
  -> triage (OpenAI): pick project + title + category + confidence
  -> create ProjectTask (reviewed=false), link IntakeMessage
  -> TwiML reply confirming the task
  -> app: amber "Unreviewed" badge + "N to review" filter + approve/reassign
```

## Decisions (see [[Decision Log]] 2026-07-13/14)

- **Transport: Twilio WhatsApp Sandbox** (trial). Bot replies free-form within the 24h window (no template).
- **Triage model: OpenAI `gpt-4o-mini`** (structured outputs via `zodResponseFormat`). Switched from Claude Haiku per user preference; swap is isolated to `triage.ts`.
- **Routing: AI infers the project.** Low confidence / no match (`< 0.5`) -> auto-created **"Inbox (unsorted)"** project instead of a wrong guess.
- **Review: auto-create the task flagged `reviewed=false`** (not a separate approval queue). A human approves (✓), reassigns (edit dialog -> Project select), edits, or deletes.
- **Senders: open to anyone (prototype).** Phone captured as `IntakeMessage.rawFrom`; no whitelist yet. Assignee left empty.

## Files

- `src/app/api/intake/whatsapp/webhook/route.ts` — Twilio form parse, `twilio.validateRequest` (URL rebuilt from `x-forwarded-proto`+`host`), TwiML reply, graceful failure.
- `src/lib/intake/triage.ts` — OpenAI structured-output classify/extract.
- `src/lib/intake/ingest.ts` — records `IntakeMessage` (incl. `transcript`/`mediaJson`), creates the task, Inbox fallback (`INBOX_PROJECT_NAME`).
- `src/lib/intake/transcribe.ts` — voice notes: fetch Twilio media (Basic auth from the payload's `AccountSid`) -> OpenAI `gpt-4o-mini-transcribe`. No new env var.
- Review UI: `UnreviewedBadge` in `status-badge.tsx`; badge + filter chip + approve in `project-detail-view.tsx` and `task-board.tsx`; reassign in `task-dialog.tsx`. Task PATCH (`api/tasks/[id]`) accepts `reviewed` and `projectId`.
- Data: `IntakeMessage` model + `ProjectTask.source`/`reviewed`/`intakeMessageId` (see [[Technical Architecture]]).

## Env

`OPENAI_API_KEY`, `TWILIO_AUTH_TOKEN` (webhook 500s without the token; triage fails -> apology reply without the key). Set locally in `.env` and in Vercel.

## Gotchas

- Webhook signature needs the **exact** public URL Twilio signed; locally `x-forwarded-proto` is `http`, on Vercel `https`.
- Next App Router ignores `_`-prefixed route folders (a `_triage-test` route 404'd).
- Twilio "ChatGPT" != API: needs an OpenAI **API key** (platform.openai.com), not a chat subscription.

## Not built / next

- **Voice notes**: shipped + verified live (Phase 4) — audio/ogg -> transcribe (`gpt-4o-mini-transcribe`) -> same triage; reply echoes "Heard: ...".
- **Phone -> `Person` whitelist** (with [[Authentication & Roles]]).
- **Create/manage projects by text** — surfaced in the live test (a "create a project" note became a task in Inbox). Not built.
