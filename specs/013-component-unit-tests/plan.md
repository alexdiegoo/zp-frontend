# Implementation Plan: Component Unit Tests

**Branch**: `013-component-unit-tests` | **Date**: 2026-07-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/013-component-unit-tests/spec.md`

## Summary

Stand up a unit-testing capability for the frontend using **Jest + React Testing Library**,
wired to Next.js via `next/jest` so tests inherit the project's TypeScript, path aliases
(`@/*`), and env handling. Cover the product's deterministic client logic in risk order:
validation schemas first (including the official-vs-unofficial WhatsApp channel branches),
then shared utility/formatting helpers, then the time/state custom hooks, and finally the
highest-reuse shared UI components. All tests run offline — the TanStack Query data layer is
mocked, no test hits the real backend — under a single `npm test` command that also gates CI.

## Technical Context

**Language/Version**: TypeScript 5 (strict), React 19.2.4, Next.js 16.2.9  
**Primary Dependencies (new, devDependencies only)**: `jest`, `jest-environment-jsdom`, `@testing-library/react`, `@testing-library/dom`, `@testing-library/jest-dom`, `@testing-library/user-event`, `@types/jest`, `ts-node`; configured through `next/jest`  
**Storage**: N/A  
**Testing**: Jest (test runner + assertions) with `next/jest` transform; React Testing Library + `user-event` for component/hook rendering; jsdom environment; fake timers for time-dependent code  
**Target Platform**: Node (Jest CLI) with jsdom DOM for component/hook tests  
**Project Type**: Web — Next.js App Router frontend (single project)  
**Performance Goals**: Full suite completes in under 30 seconds locally (SC-004); deterministic, zero flaky tests (SC-005)  
**Constraints**: No test performs a real network request or depends on a running backend (FR-008, SC-007); time-dependent tests must control the clock explicitly (FR-007)  
**Scale/Scope**: ~11 validation modules, ~10 `lib/` helper modules, 2 UI hooks, and the highest-reuse shared UI components (`DataTable`, `PageHeader`, `ApiTypeBadge`, and their empty/loading states)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Impact of this feature | Status |
|---|-----------|------------------------|--------|
| I | Explicit Server/Client Boundary | Tests add no routes; they import and exercise existing units. `page.tsx`/`view.tsx` shape untouched. | ✅ Pass |
| II | Route Handlers as the Mandatory BFF Layer | Tests never call the backend; where fetching is involved it is mocked. No client→backend calls introduced. | ✅ Pass |
| III | TanStack Query — Sole Client-Side Data Fetching | Component tests mock the query hooks / wrap in a test `QueryClientProvider`; no raw fetch or `useEffect` fetching added to product code. | ✅ Pass |
| IV | TanStack Table — Sole Table Implementation | `DataTable` tests assert the existing shared table; no alternative table introduced. | ✅ Pass |
| V | Paired Client + Server Validation | Feature *strengthens* this principle — it locks the shared Zod schemas' behavior under test. No schema logic changes. | ✅ Pass |
| VI | Strict UI Composition | No product components added or restructured; tests only render existing ones. | ✅ Pass |
| VII | Theming Only Through Tokens | No styling added. | ✅ Pass |
| VIII | Strict TypeScript | Test files are TS under the same `strict: true`; `any` forbidden — use typed fixtures / `unknown` + narrowing. | ✅ Pass |
| IX | Library Documentation Verified (Context7) | Next.js `next/jest` setup verified via Context7 (`/vercel/next.js`) before writing config. See research.md. | ✅ Pass |
| X | Performance by Default | Test-only tooling; ships nothing to the client bundle (devDependencies). | ✅ Pass |

**Stack-addition note (Governance)**: Jest + React Testing Library are **new dev-only tooling**,
not a replacement for any fixed stack choice — the constitution's fixed stack lists framework,
UI, styling, data fetching, tables, forms, and language, but **no test framework**. Adding a
test runner therefore fills a gap rather than overlapping a fixed choice, so it is **not a
deviation** requiring an exception. Recorded here for transparency.

**Result**: No violations. Complexity Tracking not required.

## Project Structure

### Documentation (this feature)

```text
specs/013-component-unit-tests/
├── plan.md              # This file
├── research.md          # Phase 0 output — tooling decisions
├── data-model.md        # Phase 1 output — the test inventory (units under test)
├── quickstart.md        # Phase 1 output — how to run & write tests
├── contracts/           # Phase 1 output — test conventions & config contract
│   └── test-conventions.md
└── tasks.md             # Phase 2 output (/speckit.tasks — NOT created here)
```

### Source Code (repository root)

Test files are **colocated** with the code they cover, named `<source>.test.ts(x)` (FR-011).
Shared test infrastructure lives at the repo root and under `src/test/`.

```text
jest.config.ts                     # next/jest config (jsdom, coverage, aliases)
jest.setup.ts                      # imports @testing-library/jest-dom; global test setup
src/
├── test/
│   ├── utils.tsx                   # renderWithProviders (QueryClientProvider wrapper)
│   └── fixtures/                   # typed domain fixtures (campaign, template, appointment…)
├── lib/
│   ├── validations/
│   │   ├── campaign.ts
│   │   ├── campaign.test.ts        # ← official vs unofficial branch coverage (P1)
│   │   ├── auth.ts
│   │   ├── auth.test.ts            # ← cross-field: password confirmation (P1)
│   │   ├── template.ts
│   │   ├── template.test.ts        # ← superRefine conditional rules + payload mappers (P1)
│   │   └── …one .test.ts per schema module
│   ├── format.ts
│   ├── format.test.ts              # ← date/currency/phone + null/invalid edges (P2)
│   ├── template-display.ts
│   ├── template-display.test.ts    # ← label/variant fallbacks + variable extraction (P2)
│   ├── calendar.ts
│   └── calendar.test.ts            # ← week math, overlap lane layout, grouping (P2)
├── hooks/ui/
│   ├── use-debounce.ts
│   ├── use-debounce.test.ts        # ← fake timers (P3)
│   ├── use-service-window.ts
│   └── use-service-window.test.ts  # ← fake timers + window open/close boundary (P3)
└── components/shared/
    ├── data-table/
    │   └── data-table.test.tsx     # ← loading / empty / populated states (P4)
    ├── layout/
    │   └── page-header.test.tsx    # ← renders title/description/actions (P4)
    └── campaign/
        └── api-type-badge.test.tsx # ← official vs unofficial rendering (P4)
```

**Structure Decision**: Single-project Next.js frontend. Colocated `*.test.ts(x)` (matches the
project's "colocate route-specific things" ethos and keeps a test next to its subject). Shared
providers and fixtures are centralized under `src/test/` so component tests never duplicate the
`QueryClientProvider` wrapper and domain objects are typed once against `types/api.ts`.

## Complexity Tracking

No constitution violations — section intentionally empty.
