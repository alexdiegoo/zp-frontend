# Phase 0 Research: Component Unit Tests

All library APIs below were verified against Context7 (`/vercel/next.js`, Jest testing guide)
per Constitution Principle IX, rather than assumed from memory.

## Decision 1 — Test runner & framework: Jest via `next/jest`

**Decision**: Use Jest configured through `next/jest` (`nextJest({ dir: './' })`), with
`testEnvironment: 'jsdom'` and `coverageProvider: 'v8'`.

**Rationale**:
- User explicitly requested Jest + React Testing Library.
- `next/jest` automatically wires the project's SWC transform, `tsconfig` path aliases
  (`@/*`), CSS-module/asset stubbing, and `.env` loading — no hand-rolled Babel/ts-jest chain
  to maintain against Next.js 16 / React 19.
- `coverageProvider: 'v8'` gives the coverage summary required by FR-009 without extra config.

**Alternatives considered**:
- **Vitest** — faster and ESM-native, but the user asked for Jest; rejected to honor the request.
- **ts-jest / babel-jest hand-config** — redundant once `next/jest` handles the transform, and
  more likely to drift from the framework's own transform. Rejected.

## Decision 2 — Component & hook rendering: React Testing Library + `user-event`

**Decision**: `@testing-library/react` (`render`, `screen`, `renderHook`, `act`, `waitFor`),
`@testing-library/user-event` for interactions, and `@testing-library/jest-dom` matchers loaded
via `setupFilesAfterEnv`.

**Rationale**:
- RTL is the user's choice and the ecosystem default for React 19.
- `renderHook` covers the two custom hooks (P3) without mounting a host component.
- `jest-dom` matchers (`toBeInTheDocument`, `toHaveTextContent`) make component assertions read
  clearly and satisfy the render-state scenarios (P4).

**Dev dependencies to add** (all `devDependencies`, nothing ships to the client bundle):
`jest`, `jest-environment-jsdom`, `@testing-library/react`, `@testing-library/dom`,
`@testing-library/jest-dom`, `@testing-library/user-event`, `@types/jest`, `ts-node`.

## Decision 3 — Deterministic time (FR-007, SC-005)

**Decision**: Use Jest fake timers (`jest.useFakeTimers()`) and, where the code reads
`Date.now()`/`new Date()`, set a fixed system time with `jest.setSystemTime(new Date('...'))`.
Advance time with `jest.advanceTimersByTime(...)` inside `act(...)`.

**Rationale**:
- `use-debounce` schedules a `setTimeout(delay)`; `use-service-window` reads `Date.now()` and
  schedules a tick at the minute boundary or exactly at expiry. Both are untestable
  deterministically against the real clock.
- Freezing time makes the open/close **boundary** (Edge Case in spec) assertable exactly at the
  expiry instant, and guarantees identical results on every run (zero flake).

**Alternatives considered**:
- Real `setTimeout` + `waitFor` — slow (adds real delay to the suite, threatening SC-004) and
  inherently flaky. Rejected.

## Decision 4 — Network isolation for component tests (FR-008, SC-007)

**Decision**: Never let a test reach the network. Two layers:
1. A shared `renderWithProviders` wrapper (in `src/test/utils.tsx`) mounts a fresh
   `QueryClient` (with `retry: false`) per test so any TanStack Query hook resolves against
   test-provided data, not a real request.
2. For components that call query hooks directly, mock the hook module (`jest.mock('@/hooks/queries/...')`)
   and return typed fixture data.

**Rationale**: Keeps component tests true unit tests, honors Constitution Principles II & III
(no client→backend call, TanStack Query stays the only fetching path), and keeps the suite fast
and offline.

## Decision 5 — Test file location & naming (FR-011)

**Decision**: Colocate `<source>.test.ts` (logic) / `<source>.test.tsx` (JSX) next to each
source file. Shared helpers live in `src/test/`.

**Rationale**: A test sits next to its subject, matching the repo's colocation ethos
(`_components/`, colocated `columns.tsx`). One consistent suffix (`.test.`) means the Jest
`testMatch` and coverage globs stay trivial.

## Decision 6 — npm scripts & CI gate (FR-001, FR-010)

**Decision**: Add scripts — `test` (`jest`), `test:watch` (`jest --watch`), `test:coverage`
(`jest --coverage`). CI runs `npm test`; a non-zero exit fails the pipeline.

**Rationale**: One command to run everything locally (SC-001); the same command gates merges so
regressions cannot land silently (FR-010). Coverage on demand satisfies FR-009 without slowing
the default run.

## Open items from spec (resolved as defaults)

- **CI coverage threshold** (spec Open Question): Do **not** enforce a numeric global threshold
  this iteration; rely on risk-prioritized coverage (validation + channel branches at 100% of
  rules, SC-002/SC-003). A threshold can be added later once the baseline is green. Rationale:
  a premature global % gate incentivizes low-value tests over the high-risk coverage that matters.
- **P4 in this iteration** (spec Open Question): Include a **thin** P4 slice (DataTable states,
  PageHeader, ApiTypeBadge) to prove the RTL setup end-to-end; defer broader component coverage
  to a follow-up. Rationale: validates the jsdom/provider harness now without ballooning scope.
