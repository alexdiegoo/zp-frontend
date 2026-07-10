# Feature Specification: Public Landing & Waitlist

**Module**: `003-public-landing-waitlist`
**Created**: 2026-07-10
**Status**: `migrated`
**Source**: reverse-engineered from codebase + git history as of commit `f8d6e2e` (2026-07-10)

> Retroactive specification — documents existing behavior. Unclear intent is recorded
> as an Open Question rather than guessed.

## Overview

The public marketing landing page is the anonymous entry point at `/`. It pitches the
ZapBlast product (WhatsApp dispatch at scale + patient-journey CRM) and captures leads
into a **waitlist (pré-cadastro)** form. It is the only route group with no session
guard and no clinic gate.

The page is a Server Component assembled from static marketing sections; only the
waitlist form is an interactive client island. Notably, the waitlist has **no backend**:
submission is validated client-side and then simulated with a delay + success toast.

Links from the landing lead to [[001-authentication-session]] (`/login`).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Read the product pitch (Priority: P1)

An anonymous visitor understands what ZapBlast does.

**Why this priority**: The landing's core purpose is to communicate value and drive
signups; it must render for anyone with no auth.

**Independent Test**: Visit `/` logged out and confirm the hero, problem/solution,
features, social proof, and CTA sections render.

**Acceptance Scenarios**:

1. **Given** an anonymous visitor, **When** they open `/`, **Then** the full landing
   renders (header, hero, problem/solution, features, social proof, waitlist CTA, footer)
   without requiring a session.
2. **Given** the landing header/footer, **When** the visitor clicks "Entrar", **Then**
   they navigate to `/login`.
3. **Given** the hero/header CTA, **When** clicked, **Then** the page anchors to the
   waitlist section (`#pre-cadastro`) or the features section (`#recursos`).

### User Story 2 - Join the waitlist (Priority: P1)

A prospective clinic submits their details to the waitlist.

**Why this priority**: Lead capture is the landing's conversion goal.

**Independent Test**: Fill the CTA form with valid values, submit, and confirm the
success toast and form reset.

**Acceptance Scenarios**:

1. **Given** the waitlist form with valid name (≥2), clinic name (≥2), email, and
   WhatsApp (matching the phone pattern), **When** submitted, **Then** the inputs and
   button disable, a ~1s delay elapses, the form resets, and a success toast shows
   "Você está na lista! Entraremos em contato em breve."
2. **Given** one or more invalid fields, **When** submitted, **Then** the first error per
   field renders inline (with `aria-invalid`/`aria-describedby`) and no submission proceeds.
3. **Given** a field with an existing error, **When** the user edits it, **Then** that
   field's error clears immediately.
4. **Given** focus in any field, **When** the user presses Enter, **Then** submission is
   triggered.

### Edge Cases

- **Re-entrant submit** while already submitting is guarded (early return).
- **No backend**: there is no network call; a failed "submission" cannot occur — the
  success path is unconditional after validation.
- **Phone regex is stricter here** (`{10,16}`) than patients/integrations (`{10,20}`).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The `/` route MUST be publicly accessible (no auth guard, no clinic gate)
  and treated as public by the route guard.
- **FR-002**: The landing MUST be a Server Component assembling static sections; only the
  waitlist CTA opts into client interactivity.
- **FR-003**: The page MUST expose SEO metadata (title + description) for the product.
- **FR-004**: The waitlist form MUST validate name (≥2), clinic name (≥2), email, and
  WhatsApp (pattern `^\+?[\d\s\-()]{10,16}$`) against the shared Zod schema before any
  (simulated) submission.
- **FR-005**: On invalid input the form MUST surface the first error per field inline and
  block submission; editing a field MUST clear its error.
- **FR-006**: On valid input the form MUST disable inputs/button, simulate a ~1s
  round-trip, reset the form, and show a success toast. There is no backend request.
- **FR-007**: The waitlist submit MUST be triggerable by Enter and guarded against
  re-entrant submission while pending.
- **FR-008**: Header and footer MUST link "Entrar" to `/login`; CTAs MUST anchor to
  `#pre-cadastro` / `#recursos`.

### Key Entities

- **PreRegisterDto**: `{ name, clinicName, email, whatsapp }` — waitlist lead, validated
  client-side only, never persisted.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The landing renders fully for anonymous visitors with no session.
- **SC-002**: A valid waitlist submission produces clear success feedback and resets the
  form for another entry.
- **SC-003**: No invalid waitlist entry proceeds past client validation.

## Explicitly Out of Scope

- **Persisting waitlist leads** — no backend, Route Handler, or storage; submission is
  simulated with `setTimeout`.
- **React Hook Form usage** — the CTA intentionally uses manual `useState` +
  `safeParse` and avoids a native `<form>` (per an in-code spec note). This diverges from
  the constitution's RHF rule; recorded in [GAPS.md](../GAPS.md).
- **Real testimonials** — the social-proof section uses placeholder (lorem ipsum) content.
- **Working privacy-policy link** — the footer link is a `#` placeholder.
- **Loading/empty/error data states** — the page is static; only the CTA has a submitting
  state.

## Open Questions

1. The waitlist has no backend. Is a persistence endpoint planned (and thus a future
   Route Handler + RHF migration), or is the simulated submission the intended MVP?
2. The WhatsApp regex max length here is 16 vs 20 elsewhere — intentional or an oversight?
3. Social-proof testimonials are placeholders — is real content expected before launch?
