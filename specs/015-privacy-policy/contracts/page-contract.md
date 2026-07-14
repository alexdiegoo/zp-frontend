# UI / Route Contract: `/privacidade`

**Feature**: `015-privacy-policy` | **Date**: 2026-07-13

This feature exposes a **public web page**, not an HTTP API. The contract below defines the
observable behavior of the route that reviewers and tests verify against.

## Route

| Property | Value |
|----------|-------|
| Path | `/privacidade` |
| Segment | `src/app/(public)/privacidade/page.tsx` |
| HTTP method | `GET` (page navigation / fetch) |
| Auth | **None** — anonymous, no session cookie required |
| Rendering | Server-rendered (static); full content in initial HTML |
| Language | Portuguese (pt-BR) |

## Guarantees

- **C-001 (FR-001, FR-013)**: A `GET /privacidade` with no cookies returns `200` and the full
  policy HTML. No redirect to `/login`, no auth challenge.
- **C-002 (FR-012, SC-006)**: The response body contains the rendered policy text (server
  component output) — an automated fetch (no JS execution) receives all required sections.
- **C-003 (FR-002)**: Content is in pt-BR; the document inherits `lang="pt-BR"` from the root
  layout.
- **C-004 (FR-003…FR-010, FR-014, SC-002)**: The HTML contains all required sections, each with
  a semantic heading and a stable anchor `id`: `dados-coletados`, `uso-dos-dados`,
  `compartilhamento`, `retencao`, `seus-direitos`, `exclusao-de-dados`,
  `controlador-e-contato`, plus a visible effective/last-updated date.
- **C-005 (FR-005)**: The sharing section names Meta / WhatsApp as a data recipient/processor.
- **C-006 (FR-007)**: The `exclusao-de-dados` section states the request channel, the steps,
  and the expected handling timeframe.
- **C-007 (FR-011, SC-005)**: At a 375px viewport the page renders with no horizontal overflow
  and readable text.
- **C-008 (metadata)**: The document `<title>` resolves to `Política de Privacidade · ZapBlast`
  (via the root layout title template) and is indexable (no `noindex`).

## Footer integration contract

- **C-009**: `LandingFooter`'s "Política de privacidade" link resolves to `/privacidade`
  (previously `href="#"`).

## Non-goals (explicit)

- No programmatic data-deletion callback endpoint (out of scope per spec Assumptions).
- No API route under `app/api/` — there is nothing to forward to a backend.
- No client-side interactivity or forms.

## Verification (maps to quickstart.md)

Each guarantee is checked either by a colocated component test (section presence, headings,
footer link) or by loading the route in the running app (anonymous access, no redirect,
mobile viewport, server-rendered HTML via `curl`).
