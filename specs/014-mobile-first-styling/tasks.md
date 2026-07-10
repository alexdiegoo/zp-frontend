# Tasks: Mobile-First Styling Refactor

**Input**: Design documents from `/specs/014-mobile-first-styling/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: The spec did not request TDD. Test tasks below are limited to **updating existing
colocated tests** for shared components that are refactored (`data-table.test.tsx`,
`page-header.test.tsx`) plus light coverage for the new shared nav — required to keep the suite
green, not new TDD.

**Organization**: Tasks are grouped by the three user stories from spec.md (P1 shell → P2 core
views → P3 consistency), matching the phases in plan.md.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 / US2 / US3 for user-story phases only

## Path Conventions

Single Next.js frontend project. All paths are relative to repo root
(`/home/alex/Documents/zapblast/zp-frontend/`).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Bring in the primitives and confirm the responsive baseline the shell will build on.

- [X] T001 Add the shadcn `Sheet` primitive via `npx shadcn@latest add sheet` (creates `src/components/ui/sheet.tsx`; do not hand-edit — Constitution VI)
- [X] T002 [P] Confirm Tailwind v4 default breakpoints in `src/app/globals.css` (`@theme` has no `--breakpoint-*` override, so `lg` = 1024px per research R1); add a short comment documenting the mobile-first + `lg` shell-switch convention
- [X] T003 [P] Add an explicit `export const viewport: Viewport` in `src/app/layout.tsx` with `width: "device-width", initialScale: 1` and **user scaling left enabled** (no `maximumScale`/`userScalable: false`) per research R4

**Checkpoint**: Drawer primitive available; breakpoint + viewport baseline confirmed.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared changes every story relies on. MUST complete before user-story phases.

**⚠️ CRITICAL**: No user story work should begin until this phase is complete.

- [X] T004 Make the shared `Section` container padding fluid — change `px-6 py-6` to `px-4 py-4 sm:px-6 sm:py-6` in `src/components/shared/layout/page-header.tsx` (affects the content gutters of every page)
- [X] T005 [P] Create a shared `use-media-query` hook at `src/hooks/ui/use-media-query.ts` (SSR-safe `window.matchMedia` wrapper; used only for JS behavior branches such as the chat pane, per research R3)
- [X] T006 [P] Update `src/components/shared/layout/page-header.test.tsx` to assert the new responsive padding classes on `Section` (keep suite green after T004)

**Checkpoint**: Foundation ready — user story implementation can begin.

---

## Phase 3: User Story 1 - Mobile-first app shell (Priority: P1) 🎯 MVP

**Goal**: The app shell (nav, top bar, content) fits phones/tablets below 1024px — drawer
navigation + full-width content — while the ≥1024px sidebar layout is preserved unchanged.

**Independent Test**: Load any authenticated page at 375px → no horizontal page scroll, content
full-width, hamburger opens/dismisses the drawer nav; at ≥1024px the sidebar+content layout is
identical to `main`.

### Implementation for User Story 1

- [X] T007 [US1] Extract the sidebar nav body into a shared presentational component `src/components/shared/layout/sidebar-nav.tsx` — move `NAV_GROUPS`, `DASHBOARD`, `NavLink`, `NavGroupBlock`, the logo block, and the footer/upgrade block out of `sidebar.tsx`; accept an optional `onNavigate` callback so a parent can close the drawer on link click
- [X] T008 [US1] Refactor `src/components/shared/layout/sidebar.tsx` to render `<SidebarNav>` inside the `<aside>` and make it desktop-only (`hidden lg:flex`); keep `w-[220px]` and existing styling for ≥1024px (depends on T007)
- [X] T009 [US1] Create `src/components/shared/layout/mobile-nav.tsx` — a `Sheet` (`side="left"`) rendering `<SidebarNav onNavigate={close} />`, with local open state and auto-close on `usePathname` change; expose a trigger button (hamburger) usable by the top bar (depends on T007, T001)
- [X] T010 [US1] Update `src/components/shared/layout/topbar.tsx` — add the `MobileNav` hamburger trigger shown only below `lg` (`lg:hidden`), make horizontal padding responsive (`px-4 lg:px-6`), and ensure the notification/user buttons meet ≥44×44px touch targets (depends on T009)
- [X] T011 [US1] Change the shell content offset in `src/components/shared/clinic/clinic-gate.tsx` from `pl-[220px]` to `lg:pl-[220px]` so content is full-width below 1024px and offset only at ≥1024px
- [X] T012 [P] [US1] Add a colocated test `src/components/shared/layout/mobile-nav.test.tsx` covering: drawer opens on trigger click, renders all nav destinations, and `onNavigate` closes it (uses `renderWithProviders`)

**Checkpoint**: The entire authenticated app is usable on mobile via the drawer; desktop unchanged. MVP is shippable here.

---

## Phase 4: User Story 2 - Core CRM views on mobile (Priority: P2)

**Goal**: The highest-value daily views (tables, chat, funnel, detail pages, forms, dashboard,
schedule) reflow to be legible and tappable on phones without full-page horizontal scroll.

**Independent Test**: At 375px, open patients, campaigns, chat, funnel, a patient detail, the
dashboard, and the schedule — each presents its data legibly, no full-page horizontal scroll,
controls tappable.

### Data tables (shared)

- [X] T013 [US2] Add responsive presentation to the shared `DataTable` base in `src/components/shared/data-table/data-table.tsx` — below `md`, render each row as a labeled card (field label + `flexRender` cell value stacked) driven by the same TanStack Table row model; at `md`+ render the existing `<Table>`; support an optional prop to force the contained `overflow-x-auto` fallback for genuinely wide tables (research R5, Constitution IV)
- [X] T014 [P] [US2] Update `src/components/shared/data-table/data-table.test.tsx` to cover the card layout below `md` and the table layout at `md`+ (matchMedia mocked) (depends on T013)

### Chat

- [X] T015 [US2] Refactor `src/app/(app)/chat/view.tsx` so that below `lg` a single pane shows — conversation list OR selected thread — using `use-media-query` + selection state, with a back affordance to return to the list; keep the two-pane layout at `lg`+ (`h-[calc(100vh-3.5rem)]` region unchanged) (depends on T005)
- [X] T016 [P] [US2] Make `src/app/(app)/chat/_components/conversation-sidebar.tsx` full-width on mobile (remove fixed width below `lg`, keep it at `lg`+)

### Funnel

- [X] T017 [P] [US2] In `src/app/(app)/funnel/view.tsx` confine the kanban horizontal scroll to the board region (already `overflow-x-auto`), verify it never triggers full-page scroll, and ensure stage headers/controls are touch-sized; adjust `min-h-[calc(100vh-160px)]` for short/landscape viewports
- [X] T018 [P] [US2] In `src/app/(app)/funnel/_components/funnel-card.tsx` ensure card actions/handles meet ≥44×44px touch targets and text truncates rather than widening the column

### Detail views

- [X] T019 [P] [US2] Refactor `src/app/(app)/patients/[id]/view.tsx` to stack its detail panels/columns on mobile (mobile-first single column → multi-column at `lg`); remove any fixed pixel widths

### Forms

- [X] T020 [P] [US2] Make the auth form container fluid on mobile in `src/app/(auth)/layout.tsx` and stack fields/full-width primary button in `src/app/(auth)/login/view.tsx` and `src/app/(auth)/register/view.tsx`
- [X] T021 [P] [US2] Stack the campaign wizard on mobile — `src/app/(app)/campaigns/new/view.tsx` and its `_components/` (`campaign-type-selector.tsx`, `contact-picker.tsx`, `campaign-success.tsx`): single-column steps, full-width controls, fluid widths
- [X] T022 [P] [US2] Stack template editor forms on mobile in `src/app/(app)/templates/new/view.tsx` and `src/app/(app)/templates/[id]/edit/view.tsx`
- [X] T023 [P] [US2] Stack settings sections on mobile in `src/app/(app)/settings/view.tsx` and `src/app/(app)/settings/_components/integrations-section.tsx`

### Dashboard & schedule

- [X] T024 [P] [US2] Verify/adjust `src/app/(app)/dashboard/view.tsx` and `src/components/dashboard/*` — metric grid already `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`; confirm single column at 375px and fix any fixed-width child
- [X] T025 [P] [US2] Make the schedule mobile-usable — `src/app/(app)/schedule/view.tsx` and `_components/` (`calendar-header.tsx`, `appointment-dialog.tsx`, `appointment-details-dialog.tsx`): responsive header toolbar, dialogs fit small screens, controls tappable
- [X] T026 [P] [US2] Make the patients list toolbar/filters responsive in `src/app/(app)/patients/view.tsx` (list itself inherits the responsive `DataTable` from T013)
- [X] T027 [P] [US2] Make the campaigns list toolbar/filters responsive in `src/app/(app)/campaigns/view.tsx` and `src/app/(app)/campaigns/_components/campaign-filters.tsx`

**Checkpoint**: US1 + US2 both work independently; all core workflows usable on a phone.

---

## Phase 5: User Story 3 - Consistency sweep & hardening (Priority: P3)

**Goal**: Every remaining page/component follows the mobile-first standard with no broken layout
at any breakpoint, and no desktop regressions.

**Independent Test**: Sweep every page at 320 / 375 / 768 / 1024 / 1280px → coherent, usable
layout with no full-page horizontal scroll, overlap, or clipping at any width.

- [X] T028 [P] [US3] Refactor remaining list/detail views not covered in US2 for mobile-first layout: `src/app/(app)/procedures/view.tsx`, `src/app/(app)/procedures/[id]/view.tsx`, `src/app/(app)/campaigns/[id]/view.tsx` (+ `_components/campaign-template-card.tsx`), `src/app/(app)/templates/view.tsx`, `src/app/(app)/templates/[id]/view.tsx`
- [X] T029 [P] [US3] Refactor the public landing page for mobile-first in `src/app/(public)/view.tsx` and `src/components/landing/*`
- [X] T030 [US3] Grep-audit the codebase for desktop-first patterns (`w-[NNpx]`, `min-w-[`, unprefixed `grid-cols-[2-9]`, `flex-row` without a stacking base) across `src/app` and `src/components`; convert each remaining hit to mobile-first; confine any intrinsic overflow to its component so no page scrolls horizontally (SC-001)
- [X] T031 [US3] Re-validate dark mode on every touched component/page at mobile and desktop widths (Constitution VII); fix any token regressions

**Checkpoint**: All stories complete; product is consistently mobile-first end to end.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification across all stories.

- [X] T032 Run the full unit suite (`npm test`) and TypeScript check; fix any failures introduced by the refactor
- [X] T033 Execute the manual responsive verification in `specs/014-mobile-first-styling/quickstart.md` across 320 / 375 / 768 / 1024 / 1280px, confirming SC-001…SC-006 (no horizontal page scroll, ≤2 taps to any nav destination, ≥44px touch targets, no desktop regression, pinch-zoom enabled)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational. Delivers the MVP.
- **User Story 2 (Phase 4)**: Depends on Foundational. Independently testable; benefits from US1's shell for realistic testing but does not require US1 code.
- **User Story 3 (Phase 5)**: Depends on Foundational. Best done after US2 (sweeps what US2 didn't cover) but independently verifiable.
- **Polish (Phase 6)**: Depends on all desired stories being complete.

### Key task dependencies

- T007 → T008, T009 (SidebarNav must exist before sidebar/drawer use it)
- T001 → T009 (Sheet primitive before MobileNav)
- T009 → T010 (MobileNav before its top-bar trigger)
- T004 → T006; T013 → T014; T005 → T015 (implementation before its test/consumer)

### Parallel Opportunities

- Setup: T002, T003 in parallel (T001 first — others don't depend on it).
- Foundational: T005, T006 in parallel (after T004).
- US1: T012 parallel with the shell wiring once T007–T009 land.
- US2: T016–T027 are largely different files → run in parallel after T013 (tables) and T005 (media query) are in place.
- US3: T028, T029 in parallel; T030, T031 after them.

---

## Parallel Example: User Story 2

```bash
# After T013 (responsive DataTable) and T005 (use-media-query) are done,
# these touch different files and can run in parallel:
Task: "Funnel board scroll/touch in src/app/(app)/funnel/view.tsx"           # T017
Task: "Patient detail stacking in src/app/(app)/patients/[id]/view.tsx"      # T019
Task: "Auth forms stacking in src/app/(auth)/{login,register}/view.tsx"      # T020
Task: "Campaign wizard stacking in src/app/(app)/campaigns/new/*"            # T021
Task: "Settings stacking in src/app/(app)/settings/*"                        # T023
Task: "Dashboard grid verify in src/app/(app)/dashboard/view.tsx"            # T024
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Phase 1: Setup (Sheet, viewport, breakpoints).
2. Phase 2: Foundational (fluid Section, media-query hook).
3. Phase 3: User Story 1 (responsive shell + drawer).
4. **STOP and VALIDATE**: The whole app is now usable on mobile through the drawer — shippable MVP.

### Incremental Delivery

1. Setup + Foundational → baseline ready.
2. US1 → mobile shell → demo (MVP).
3. US2 → core views reflow → demo.
4. US3 → consistency sweep + hardening → demo.
5. Polish → full quickstart sweep.

---

## Notes

- [P] = different files, no incomplete dependencies.
- Every UI change must preserve theme tokens and be validated in dark mode (Constitution VII).
- New primitives (`Sheet`) are added via the shadcn CLI, never hand-edited (Constitution VI).
- No data-layer, Route Handler, or Zod schema changes in this feature (data-model.md).
- Commit after each task or logical group; stop at any checkpoint to validate a story independently.
