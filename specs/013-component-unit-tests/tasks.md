# Tasks: Component Unit Tests

**Input**: Design documents from `/specs/013-component-unit-tests/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/test-conventions.md, quickstart.md

**Note**: For this feature the *deliverable is the test suite itself*. Each user-story phase
produces the test files for that risk slice (P1→P4). "Independent test" for each phase means:
run `npm test -- <path>` for just that phase's files and see them pass.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US4)
- Paths are absolute-from-repo-root under `/home/alex/Documents/zapblast/zp-frontend/`

## Path Conventions

- Config at repo root (`jest.config.ts`, `jest.setup.ts`)
- Shared test infra under `src/test/`
- Test files colocated: `<source>.test.ts(x)` next to the source (per contracts/test-conventions.md §3)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install and wire the Jest + RTL toolchain via `next/jest` so any test can run.

- [X] T001 Install dev dependencies: run `npm install -D jest jest-environment-jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom @testing-library/user-event @types/jest ts-node`
- [X] T002 Create `jest.config.ts` at repo root using `next/jest` (`nextJest({ dir: "./" })`) with `testEnvironment: "jsdom"`, `coverageProvider: "v8"`, `setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"]`, `moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" }`, and `collectCoverageFrom` over `src/lib`, `src/hooks`, `src/components/shared` (see contracts/test-conventions.md §1)
- [X] T003 [P] Create `jest.setup.ts` at repo root importing `@testing-library/jest-dom`
- [X] T004 [P] Add `test`, `test:watch`, `test:coverage` scripts to `package.json` (see contracts/test-conventions.md §2)
- [X] T005 Add a trivial smoke test `src/lib/utils.test.ts` for `cn` and run `npm test` to confirm the toolchain resolves `@/*` aliases and jsdom loads (verifies Setup end-to-end)

**Checkpoint**: `npm test` runs and the smoke test passes. Toolchain proven.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared test helpers needed by the hook (US3) and component (US4) slices. US1 and
US2 do NOT depend on this phase and may start right after Setup.

**⚠️ CRITICAL**: US3 and US4 cannot begin until this phase is complete.

- [X] T006 [P] Create `src/test/utils.tsx` exporting `renderWithProviders` — wraps `render` in a fresh `QueryClient` (`defaultOptions: { queries: { retry: false } }`) `QueryClientProvider` plus the app's theme provider (see research.md Decision 4)
- [X] T007 [P] Create `src/test/fixtures/` with typed factory builders — `makeAppointment`, `makeCampaign`, `makeTemplateDetail`, `makeWindowStatus` — built against `src/types/api.ts` and `src/types/chat.ts` (no `any`)

**Checkpoint**: Shared provider wrapper + fixtures available. All four stories can now proceed.

---

## Phase 3: User Story 1 - Validation rules are guarded by tests (Priority: P1) 🎯 MVP

**Goal**: Lock every shared Zod schema's accepted/rejected boundaries, including the
official-vs-unofficial WhatsApp channel branches.

**Independent Test**: `npm test -- src/lib/validations` — every schema module has a passing
test covering ≥1 accepted and ≥1 rejected input with the expected message; both campaign
channels covered (SC-002, SC-003).

- [X] T008 [P] [US1] `src/lib/validations/auth.test.ts` — `loginSchema` (email required/format, password ≥8) and `registerSchema` cross-field password match error on `confirmPassword` path
- [X] T009 [P] [US1] `src/lib/validations/campaign.test.ts` — `createCampaignSchema` discriminated union: accepted OFFICIAL (phone+template+≥1 contact) and UNOFFICIAL (message 10–4096); rejected cases proving each channel enforces its own required fields (**SC-003**); plus `campaignsQuerySchema` coercion/bounds/defaults
- [X] T010 [P] [US1] `src/lib/validations/template.test.ts` — `createTemplateFormSchema` `superRefine` (name regex, body caps, `NONE` header text length/newline/emoji rules, `IMAGE` requires `headerMediaUrl`, URL button requires valid http(s)); `toCreateTemplatePayload` mapping (NONE+text→TEXT, prune empties, keep only in-body variable examples); `templatesQuerySchema`/`syncTemplatesSchema`
- [X] T011 [P] [US1] `src/lib/validations/patient.test.ts` — required fields + phone/email formats, null vs empty-string distinction
- [X] T012 [P] [US1] `src/lib/validations/appointment.test.ts` — required fields, enum values, date/time constraints
- [X] T013 [P] [US1] `src/lib/validations/procedure.test.ts` — required fields, numeric/price bounds, enums
- [X] T014 [P] [US1] `src/lib/validations/clinic.test.ts` — required fields and formats
- [X] T015 [P] [US1] `src/lib/validations/funnel.test.ts` — stage/field rules and enums
- [X] T016 [P] [US1] `src/lib/validations/chat.test.ts` — message/body rules and any channel-conditional fields
- [X] T017 [P] [US1] `src/lib/validations/integrations.test.ts` — required fields and enum/format rules
- [X] T018 [P] [US1] `src/lib/validations/pre-register.test.ts` — required fields and format rules
- [X] T019 [US1] Run `npm test -- src/lib/validations` and confirm 100% of schema modules have accepted+rejected coverage (SC-002); fix any gaps

**Checkpoint**: All validation rules tested independently. MVP deliverable complete.

---

## Phase 4: User Story 2 - Shared utility & formatting logic is verified (Priority: P2)

**Goal**: Lock the pure helpers (dates, currency, phone, template display, calendar geometry)
including documented null/edge fallbacks.

**Independent Test**: `npm test -- src/lib/format.test src/lib/template-display.test src/lib/calendar.test` — each helper matches expected output for normal and boundary inputs.

- [X] T020 [P] [US2] `src/lib/format.test.ts` — `formatDate`/`formatDateTime` (ISO→pt-BR, null/invalid→`—`), `formatCurrency` (BRL, null/NaN→`—`), `formatPhone` (13-digit `55…`, 11-digit, unrecognized→raw, null→`—`)
- [X] T021 [P] [US2] `src/lib/template-display.test.ts` — label/variant getters map known enums and fall back on unknown (`outline`/`secondary`/raw); `extractTemplateVariables` unique + first-seen order, no-match→`[]`
- [X] T022 [P] [US2] `src/lib/calendar.test.ts` — date math (`startOfWeek` Sunday-anchored, `getWeekDays`, `isSameDay`, `isWeekend`, `dayKey`, `slotToDate`, `minutesSinceMidnight`) with `jest.setSystemTime` for `isToday`; `formatWeekRange` shared/cross month+year; `layoutDayAppointments` overlap→lanes and min-height floor; `groupByDay` (uses `src/test/fixtures` from T007)

**Checkpoint**: US1 + US2 both pass independently.

---

## Phase 5: User Story 3 - Interactive behaviors in custom hooks are covered (Priority: P3)

**Goal**: Lock the time/state hooks deterministically with fake timers.

**Independent Test**: `npm test -- src/hooks/ui` — debounce delay boundary and service-window open/close boundary assert correctly and repeatably (SC-005).

**Depends on**: Phase 2 (T007 fixture `makeWindowStatus`).

- [X] T023 [P] [US3] `src/hooks/ui/use-debounce.test.ts` — `jest.useFakeTimers()`; value stays old at `delay-1`ms, updates to latest at `delay`ms; rapid re-renders reset the timer (`renderHook` + `advanceTimersByTime` in `act`)
- [X] T024 [P] [US3] `src/hooks/ui/use-service-window.test.ts` — `jest.setSystemTime(fixed)` + fake timers; `isOpen` true inside window and false exactly at/after `expiresAt` (boundary edge case); `remainingLabel` formats (`Xh Ymin`/`Ymin`/`menos de 1min`); `expiresAt`/`isOpen` null/false when `windowStatus` undefined; assert the minute-boundary tick does not loop (single re-render per tick)

**Checkpoint**: US1–US3 pass independently.

---

## Phase 6: User Story 4 - Shared UI components render & respond (Priority: P4)

**Goal**: Prove the RTL + jsdom harness end-to-end on the highest-reuse shared components.

**Independent Test**: `npm test -- src/components/shared` — loading/empty/populated states render, and the channel badge distinguishes official vs unofficial (SC-003 at UI layer).

**Depends on**: Phase 2 (T006 `renderWithProviders`, T007 fixtures).

- [X] T025 [P] [US4] `src/components/shared/data-table/data-table.test.tsx` — `isLoading`→skeleton (not rows); empty `data`→`emptyMessage`; populated→one row per item with cells rendered
- [X] T026 [P] [US4] `src/components/shared/layout/page-header.test.tsx` — renders title, optional description, and action slot children
- [X] T027 [P] [US4] `src/components/shared/campaign/api-type-badge.test.tsx` — OFFICIAL vs UNOFFICIAL render distinctly (**SC-003**)

**Checkpoint**: All four stories pass independently.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Lock the suite into the workflow and confirm the spec's success criteria.

- [X] T028 Run `npm run test:coverage` and confirm the summary covers `src/lib`, `src/hooks`, `src/components/shared` (FR-009); record baseline in PR description
- [X] T029 Run the full suite twice (`npm test` back-to-back) and confirm identical results — zero flaky tests (SC-005); time it to confirm <30s (SC-004)
- [X] T030 Add a CI step that runs `npm test` and fails the pipeline on non-zero exit (FR-010, `.github/workflows/*` or the project's CI config)
- [X] T031 [P] Update `CLAUDE.md` "Error & Loading States"/testing guidance with a short "Running & writing tests" pointer to `specs/013-component-unit-tests/quickstart.md`
- [X] T032 Walk through `quickstart.md` from a clean checkout to confirm the documented commands and examples work as written

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately. Blocks everything.
- **Foundational (Phase 2)**: Depends on Setup. Blocks US3 and US4 only.
- **US1 (Phase 3)** and **US2 (Phase 4)**: Depend on Setup (Phase 1) only — may start before/parallel to Phase 2.
- **US3 (Phase 5)** and **US4 (Phase 6)**: Depend on Setup + Foundational.
- **Polish (Phase 7)**: Depends on all desired story phases complete.

### User Story Dependencies

- **US1 (P1)**: Setup only. No dependency on other stories. ← MVP
- **US2 (P2)**: Setup only (T022 uses the T007 fixture; if starting before Phase 2, build the appointment fixture inline).
- **US3 (P3)**: Setup + T007 fixture.
- **US4 (P4)**: Setup + T006 + T007.

### Within Each Story

- All test files in a story are independent (different files) → all `[P]`.
- The story's final "run & confirm" task (e.g. T019) depends on that story's test tasks.

### Parallel Opportunities

- T003, T004 run parallel to each other (after T001/T002 for T002-dependent config).
- T006, T007 run in parallel.
- **All of T008–T018 (US1) run in parallel** — 11 independent schema test files.
- T020–T022 (US2) run in parallel; T023–T024 (US3) in parallel; T025–T027 (US4) in parallel.

---

## Parallel Example: User Story 1 (the MVP)

```bash
# After Setup, author all 11 validation test files concurrently:
Task: "auth.test.ts — login + register cross-field"          # T008
Task: "campaign.test.ts — official vs unofficial union"      # T009
Task: "template.test.ts — superRefine + payload mapper"      # T010
Task: "patient.test.ts"                                       # T011
Task: "appointment.test.ts"                                   # T012
Task: "procedure.test.ts / clinic / funnel / chat / …"       # T013–T018
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Phase 1 Setup → `npm test` green on smoke test.
2. Phase 3 US1 → all validation schemas covered (accepted + rejected, both channels).
3. **STOP and VALIDATE**: `npm test -- src/lib/validations` green. This alone delivers the
   highest-risk safety (SC-002, SC-003) and is a shippable increment.

### Incremental Delivery

1. Setup → toolchain ready.
2. US1 (validation) → test → **MVP**.
3. US2 (utilities) → test → ship.
4. Foundational (T006/T007) + US3 (hooks) → test → ship.
5. US4 (components) → test → ship.
6. Polish → CI gate + coverage + determinism confirmation.

### Notes

- `[P]` = different files, no dependencies.
- No product source is modified — only test files, config, and shared test infra are added
  (keeps the Constitution Check clean: no schema/component behavior changes).
- Commit after each story phase; each checkpoint is independently green.
