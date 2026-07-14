---
description: "Task list for 015-privacy-policy"
---

# Tasks: Privacy Policy Page for Facebook App

**Input**: Design documents from `/specs/015-privacy-policy/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/page-contract.md, quickstart.md

**Tests**: Included — the project runs Jest + React Testing Library with colocated `*.test.tsx`, and `quickstart.md` specifies test assertions. Test tasks are scoped to what is meaningfully testable (section presence, footer wiring).

**Organization**: Tasks are grouped by user story (US1 = P1 MVP, US2 = P2, US3 = P3) so each is an independently testable increment.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: US1 / US2 / US3 (user-story phases only)
- Paths are absolute-from-repo-root and exact.

## Path Conventions

Next.js App Router frontend; route lives under `src/app/(public)/privacidade/`. No backend, no API routes.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the route location.

- [X] T001 Create the route directory `src/app/(public)/privacidade/` and its `_components/` subfolder (empty scaffolding for the files added below).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The page scaffold and the shared section primitive that every user story fills. **No user-story content can be added until this phase is complete.**

**⚠️ CRITICAL**: All three stories render into the same `view.tsx` via `PolicySection`, so these must exist first.

- [X] T002 [P] Create the presentational section wrapper in `src/app/(public)/privacidade/_components/policy-section.tsx` — a Server Component accepting `{ id: string; title: string; children: React.ReactNode }`, rendering a `<section id={id}>` with a semantic heading and token-styled body (headings/paragraphs/lists via token classes only — no `prose`, no hardcoded colors). Props typed per `data-model.md` (§PolicySection).
- [X] T003 [P] Create `src/app/(public)/privacidade/_content.ts` exporting a typed `PolicyMetadata` constant (`controller`, `contactChannel`, `effectiveDate`, `dataDeletion: { channel, timeframe }`) per `data-model.md` (§PolicyMetadata), with clearly-labeled editable placeholder pt-BR values. No `any`; use `type` for the shape and `satisfies`.
- [X] T004 Create the Server Component shell `src/app/(public)/privacidade/page.tsx` — export a static `metadata: Metadata` (`title: "Política de Privacidade"`, pt-BR `description`; do NOT set `noindex`) and render `<PrivacyPolicyView />` only. No `"use client"`. (Metadata API verified via Context7 `/vercel/next.js`.)
- [X] T005 Create the Server Component `src/app/(public)/privacidade/view.tsx` — named export `PrivacyPolicyView`, no `"use client"`. Compose `LandingHeader` (from `@/components/landing/landing-header`), a `<main>` container styled with token classes for readable measure + mobile padding (no horizontal overflow at 375px), and `LandingFooter`. Leave the section list empty for now (stories fill it). Depends on: T002.

**Checkpoint**: Route resolves at `/privacidade` with header/footer chrome and no auth gate — story content can now be added.

---

## Phase 3: User Story 1 — Public visitor reads the privacy policy (Priority: P1) 🎯 MVP

**Goal**: Anonymous visitors (and Meta reviewers) can open `/privacidade` and read the core policy body, server-rendered, at a stable public URL.

**Independent Test**: In an incognito window with no session, open `/privacidade` → full page renders, no redirect to `/login`; `curl -s /privacidade` returns the core disclosure section text in the raw HTML.

- [X] T006 [US1] Add the core disclosure sections to `src/app/(public)/privacidade/view.tsx` using `PolicySection`, in order: `introducao` (intro & scope), `dados-coletados` (categories collected + purpose — FR-003), `uso-dos-dados` (usage incl. WhatsApp campaign dispatch via Meta — FR-004), `compartilhamento` (third-party sharing; explicitly names Meta/WhatsApp as processor — FR-005), `retencao` (retention period + basis — FR-006). pt-BR placeholder copy; each section has a stable anchor `id`. Depends on: T005.
- [X] T007 [US1] Verify anonymous, unauthenticated access and server rendering: confirm `src/app/(public)/privacidade/` inherits `(public)/layout.tsx` (no guard) and that `curl -s http://localhost:3000/privacidade` returns the section text in raw HTML (proves not client-gated — FR-012/FR-013, contract C-001/C-002). No code change if it passes; otherwise fix placement. Depends on: T006.

**Checkpoint**: MVP — a citable, public, server-rendered policy page exists. Deliverable on its own.

---

## Phase 4: User Story 2 — Data deletion & LGPD rights (Priority: P2)

**Goal**: A data subject can find how to request deletion and what rights they hold.

**Independent Test**: On `/privacidade`, locate the "Seus direitos" and "Exclusão de dados" sections; the deletion section states the request channel, the steps, and the handling timeframe.

- [X] T008 [US2] Populate the `dataDeletion` values (`channel`, `timeframe`) in `src/app/(public)/privacidade/_content.ts` with pt-BR placeholder text. Depends on: T003.
- [X] T009 [US2] Add the `seus-direitos` section to `src/app/(public)/privacidade/view.tsx` enumerating the LGPD rights — access, correction, deletion, portability, consent revocation (FR-008). Depends on: T006.
- [X] T010 [US2] Add the `exclusao-de-dados` section to `src/app/(public)/privacidade/view.tsx` with step-by-step written deletion instructions, pulling `channel` and `timeframe` from `_content.ts` (FR-007, contract C-006). Depends on: T008, T006.

**Checkpoint**: Deletion path and rights are documented — satisfies the Meta/LGPD deletion-instructions requirement.

---

## Phase 5: User Story 3 — Controller, effective date & contact (Priority: P3)

**Goal**: A reader can identify the data controller, the effective/last-updated date, and a privacy contact.

**Independent Test**: On `/privacidade`, the controller identity and privacy contact appear, and an effective/last-updated date is clearly visible.

- [X] T011 [US3] Populate `controller`, `contactChannel`, and `effectiveDate` in `src/app/(public)/privacidade/_content.ts` with pt-BR placeholder values. Depends on: T003.
- [X] T012 [US3] Add the `controlador-e-contato` section to `src/app/(public)/privacidade/view.tsx` showing the controller identity and privacy contact from `_content.ts` (FR-009). Depends on: T011, T006.
- [X] T013 [US3] Render the `effectiveDate` prominently (header of the content area or top of `<main>`) in `src/app/(public)/privacidade/view.tsx` (FR-010, contract C-004). Depends on: T011, T005.

**Checkpoint**: All required topics present — SC-002 fully satisfied.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Wire the entry point, add tests, and validate the contract guarantees.

- [X] T014 Wire the footer link in `src/components/landing/landing-footer.tsx` — change the "Política de privacidade" link from `href="#"` to `href="/privacidade"` (contract C-009).
- [X] T015 [P] Add `src/components/landing/landing-footer.test.tsx` asserting the "Política de privacidade" link resolves to `/privacidade`. Depends on: T014.
- [X] T016 [P] Add `src/app/(public)/privacidade/view.test.tsx` (render `PrivacyPolicyView`) asserting: all required section anchor `id`s / headings are present (SC-002); the `compartilhamento` section mentions Meta/WhatsApp (C-005); the `exclusao-de-dados` section mentions the contact channel and a timeframe (C-006). Depends on: T010, T012, T013.
- [X] T017 [P] Validate presentation: dark mode correct (tokens only, no hardcoded colors — Principle VII) and no horizontal scroll / readable text at a 375px viewport (FR-011, SC-005, contract C-007). Depends on: T013.
- [X] T018 Run `npm test -- privacidade landing-footer` and `npm run build`; confirm tests pass, no TypeScript errors, and metadata title resolves to `Política de Privacidade · ZapBlast` (C-008). Depends on: T015, T016.

---

## Dependencies & Execution Order

**Phase order**: Setup (T001) → Foundational (T002–T005) → US1 (T006–T007) → US2 (T008–T010) → US3 (T011–T013) → Polish (T014–T018).

**Blocking**:
- Foundational blocks all stories (shared `view.tsx` + `PolicySection`).
- T005 (view skeleton) depends on T002 (section wrapper).
- All content sections (T006, T009, T010, T012, T013) edit the same `view.tsx` → within a story they are **sequential**, not parallel.
- `_content.ts` value tasks (T008, T011) are independent of the view and can precede their consuming section tasks.

**Story independence**: US1 is a viable MVP alone. US2 and US3 each add their own sections and content values; neither breaks US1. US2 and US3 touch the same `view.tsx`, so run them in sequence (US2 then US3), not concurrently.

## Parallel Opportunities

- **Foundational**: T002 and T003 are `[P]` (different files). T004 (page.tsx) is also independent of T002/T003 and may run alongside them; T005 must follow T002.
- **Content values vs sections**: T008 and T011 (both edit `_content.ts` — do NOT parallelize with each other, same file) can each run before their section tasks.
- **Polish**: T015, T016, T017 are `[P]` (distinct files/concerns) once their dependencies are met.

```text
# Example parallel batch (Foundational):
T002  Create policy-section.tsx
T003  Create _content.ts skeleton
T004  Create page.tsx shell
# → then T005 (view skeleton, needs T002)
```

## Implementation Strategy

- **MVP = Phase 1 + Phase 2 + Phase 3 (US1)**: a public, server-rendered, stable-URL policy with the core disclosures. This alone structurally unblocks Meta app-review submission.
- **Increment 2 (US2)**: deletion instructions + LGPD rights — completes the compliance-critical content.
- **Increment 3 (US3)**: controller/contact/date — completeness and trust.
- **Polish**: footer wiring + tests + dark-mode/mobile validation.
- Note: final legal wording is business-supplied; all copy tasks ship review-ready pt-BR placeholders that swap in without structural change (research.md §Decision 7).
