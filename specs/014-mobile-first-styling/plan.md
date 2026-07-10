# Implementation Plan: Mobile-First Styling Refactor

**Branch**: `014-mobile-first-styling` | **Date**: 2026-07-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/014-mobile-first-styling/spec.md`

## Summary

Refactor the ZapBlast frontend from its current desktop-first layout to a mobile-first
responsive design. The app shell today assumes a large screen: a `fixed w-[220px]` sidebar is
always visible and content is hard-offset by `pl-[220px]`, the chat page uses a competing
two-pane layout, and only ~29% of component files use any responsive utilities. The refactor
inverts this: unprefixed styles target small screens, and `lg:` (1024px) enhancements restore
the desktop sidebar-plus-content layout. Below 1024px the sidebar becomes a dismissible Sheet
drawer triggered from the top bar; data tables stack into cards; the chat collapses to a single
navigable pane; and every page reflows cleanly from 320px up with no horizontal page scroll.
No functionality, data, routing, or theming changes — layout/adaptation only.

## Technical Context

**Language/Version**: TypeScript (strict), Next.js 16 App Router, React 19
**Primary Dependencies**: Tailwind CSS v4 (CSS `@theme`, default breakpoints), shadcn/ui (Radix),
  TanStack Query v5, TanStack Table v8, React Hook Form v7 + Zod v4
**Storage**: N/A (presentation-only feature)
**Testing**: Jest + React Testing Library (`next/jest`); manual responsive verification via browser devtools across 320 / 375 / 768 / 1024 / 1280px
**Target Platform**: Modern mobile + desktop browsers; responsive web (no native app)
**Project Type**: Web application (Next.js frontend, single project)
**Performance Goals**: No new client-bundle weight of significance; drawer uses an existing Radix
  primitive; no layout-shift regressions; 60fps drawer open/close
**Constraints**: No horizontal page scroll at any width ≥320px; layout breakpoint fixed at 1024px
  (`lg`); primary touch targets ≥44×44px; existing theme tokens and dark mode preserved; user
  scaling (pinch-zoom) MUST remain enabled (accessibility)
**Scale/Scope**: ~19 route views + shared shell (sidebar, top bar, clinic gate), data-table base,
  form building blocks, and the public landing + auth pages. ~136 `.tsx` files, ~19 views.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| # | Principle | Impact of this feature | Status |
|---|-----------|------------------------|--------|
| I | Explicit Server/Client Boundary | No `page.tsx` gains `"use client"`; all changes stay in existing `view.tsx`/shared client components. New `MobileNav` is a client component; the shell (`ClinicGate`) already is. | ✅ Pass |
| II | Route Handlers as BFF | No data access changes; no new/modified Route Handlers. | ✅ Pass (N/A) |
| III | TanStack Query — sole fetching | No fetching changes. | ✅ Pass (N/A) |
| IV | TanStack Table — sole table impl | Mobile "card" presentation is added **inside** the shared `DataTable` base (responsive rendering of the same table instance); no new table library, no raw `<table>`. | ✅ Pass |
| V | Paired Client + Server Validation | Forms are only restyled (stacking/spacing); schemas and RHF wiring untouched. | ✅ Pass (N/A) |
| VI | Strict UI Composition | Responsive nav extracted into a shared component reused by desktop sidebar + mobile drawer (no duplication). `Sheet` added via `npx shadcn@latest add sheet` (not hand-authored). `Section`/`PageHeader` gain responsive padding centrally. | ✅ Pass |
| VII | Theming Only Through Tokens | Only layout/spacing/breakpoint utilities change; no color literals introduced. Dark mode re-validated per touched component. | ✅ Pass |
| VIII | Strict TypeScript | No `any`; new props typed; drawer open-state typed. | ✅ Pass |
| IX | Library Docs Verified (Context7) | Tailwind v4 breakpoints, shadcn Sheet, and Next `viewport` verified in Phase 0 (see research.md). | ✅ Pass |
| X | Performance by Default | Shell remains server-rendered where possible; drawer is CSS-toggled (`lg:hidden` / `hidden lg:flex`) to avoid a JS media-query hydration flash; no large data added to the bundle. | ✅ Pass |

**Result**: PASS — no violations, no exceptions required. Complexity Tracking section omitted.

## Project Structure

### Documentation (this feature)

```text
specs/014-mobile-first-styling/
├── plan.md              # This file
├── research.md          # Phase 0 output — responsive approach decisions
├── data-model.md        # Phase 1 output — N/A rationale (no entities)
├── quickstart.md        # Phase 1 output — how to verify mobile-first behavior
├── checklists/
│   └── requirements.md   # From /speckit.specify
└── tasks.md             # Phase 2 output (/speckit.tasks — NOT created here)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── layout.tsx                         # (opt.) explicit `viewport` export; keep user scaling on
│   ├── globals.css                        # Tailwind v4 @theme — confirm default breakpoints; no override needed
│   ├── (app)/
│   │   ├── chat/view.tsx                   # two-pane → single navigable pane below lg
│   │   ├── funnel/view.tsx                 # kanban: contained horizontal scroll + touch targets
│   │   ├── dashboard/view.tsx              # already responsive grid — verify only
│   │   ├── patients/ · campaigns/ · procedures/ · templates/ · schedule/ · settings/
│   │   │                                   # each view.tsx: responsive PageHeader/toolbars/grids
│   │   └── **/_components/*                # detail panels, toolbars — reflow to stack on mobile
│   ├── (auth)/{login,register}/view.tsx    # form container widths → fluid on mobile
│   └── (public)/view.tsx                   # landing page reflow
│
├── components/
│   ├── ui/
│   │   └── sheet.tsx                       # NEW — added via `npx shadcn@latest add sheet`
│   └── shared/
│       ├── layout/
│       │   ├── sidebar.tsx                 # desktop: `hidden lg:flex`; extract nav to SidebarNav
│       │   ├── sidebar-nav.tsx             # NEW — shared nav body (reused by sidebar + drawer)
│       │   ├── mobile-nav.tsx              # NEW — Sheet drawer wrapping SidebarNav (lg:hidden trigger)
│       │   ├── topbar.tsx                  # add menu trigger (lg:hidden); responsive px
│       │   └── page-header.tsx             # Section: `px-4 sm:px-6`; header already sm:flex-row
│       ├── clinic/clinic-gate.tsx          # shell: `pl-[220px]` → `lg:pl-[220px]`
│       └── data-table/
│           ├── data-table.tsx              # responsive: card/stacked rows below md, table at md+
│           └── data-table-card.tsx         # NEW — mobile row-as-card renderer (optional split)
│
└── hooks/ui/
    └── use-media-query.ts                  # NEW (only if a JS breakpoint check proves necessary)
```

**Structure Decision**: Single Next.js frontend project (constitution-fixed stack). Changes are
concentrated in the shared layout shell and the `DataTable` base — the two highest-leverage
surfaces — then propagated per-view. The mobile navigation is a **new shared component**
(`mobile-nav.tsx` + `sidebar-nav.tsx`) so the desktop sidebar and the mobile drawer render the
**same** nav definition (Principle VI, no duplication). The drawer visibility is CSS-driven
(`lg:hidden` trigger, `hidden lg:flex` sidebar) rather than JS-media-query-gated, to avoid a
hydration flash (Principle X); a `use-media-query` hook is introduced only if a component
genuinely needs to branch in JS (e.g. chat pane selection state).

## Implementation Phases

The three phases map 1:1 to the spec's prioritized user stories; each is independently shippable.

### Phase A — Mobile-first app shell (User Story 1, P1)

The MVP slice that unlocks mobile for the entire product.

1. Add `Sheet` primitive via `npx shadcn@latest add sheet`.
2. Extract the sidebar nav body into `SidebarNav` (shared, presentational).
3. `Sidebar` renders `SidebarNav` inside `<aside className="... hidden lg:flex ...">`.
4. Add `MobileNav` — a `Sheet` (side="left") containing `SidebarNav`, triggered by a hamburger
   button placed in `Topbar` and shown only `lg:hidden`. Close on navigation.
5. `ClinicGate`: change content offset `pl-[220px]` → `lg:pl-[220px]`; ensure full-width below lg.
6. `Topbar`: responsive horizontal padding (`px-4 lg:px-6`), hamburger on the left `lg:hidden`,
   ensure ≥44px touch targets for notification/user buttons.
7. `Section`: `px-4 sm:px-6` so page content has comfortable but fluid gutters.
8. Confirm root `viewport` default (Next injects `width=device-width, initial-scale=1`); add an
   explicit `export const viewport` only if a `themeColor` is desired — keep `userScalable` on.

**Independent test**: any authenticated page at 375px — no horizontal scroll, content full-width,
hamburger opens/dismisses the drawer; at ≥1024px the sidebar+content layout is unchanged.

### Phase B — Core CRM views on mobile (User Story 2, P2)

1. **DataTable base**: add a responsive presentation — below `md`, render each row as a labeled
   card (field label + value stacked); at `md`+, render the normal table. Falls back to a
   contained `overflow-x-auto` region only for tables flagged as too wide for cards.
2. **Chat** (`chat/view.tsx`): below `lg`, show the conversation list OR the thread (single pane)
   with a back affordance; keep the two-pane layout at `lg`+. Selection state drives which pane
   shows on mobile (may use `use-media-query`).
3. **Funnel** (`funnel/view.tsx`): keep horizontal scroll confined to the board; ensure cards and
   stage controls meet touch-target sizing; verify short-viewport (landscape) usability.
4. **Forms** (login, register, campaign new, template new/edit, settings): stack fields/labels/
   actions vertically on mobile; fluid container widths; full-width primary buttons on mobile.
5. **Dashboard/schedule**: verify existing grids collapse to single column; fix any fixed widths.

**Independent test**: patients, campaigns, chat, funnel, dashboard, schedule each usable at 375px
with no lost data, no full-page horizontal scroll, tappable controls.

### Phase C — Consistency sweep + hardening (User Story 3, P3)

1. Audit every remaining `view.tsx` and `_components/*` for fixed widths (`w-[...px]`, `min-w-`),
   desktop-only grids, and unprefixed multi-column layouts; convert to mobile-first.
2. Grep for full-page overflow sources; confine any intrinsic overflow to the component.
3. Re-validate dark mode on every touched component (Principle VII).
4. Sweep 320 / 375 / 768 / 1024 / 1280px on all pages against SC-001, SC-004, SC-005.

**Independent test**: full page sweep across breakpoints with no broken/overlapping/clipped
layout and no desktop regression.

## Complexity Tracking

*No constitution violations — section intentionally empty.*
