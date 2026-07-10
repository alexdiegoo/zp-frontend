# Contract: Test Conventions & Configuration

The "interface" this feature exposes is the testing convention every future test must follow
and the config contract the tooling depends on. Treat this as the acceptance contract.

## 1. Configuration contract

**`jest.config.ts`** (created via `next/jest`):

```ts
import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

const config: Config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" },
  collectCoverageFrom: [
    "src/lib/**/*.{ts,tsx}",
    "src/hooks/**/*.{ts,tsx}",
    "src/components/shared/**/*.{ts,tsx}",
  ],
};

export default createJestConfig(config);
```

> `next/jest` already applies the `tsconfig` path aliases, but `moduleNameMapper` is declared
> explicitly so the mapping is self-documenting and stable.

**`jest.setup.ts`**:

```ts
import "@testing-library/jest-dom";
```

## 2. Package scripts contract (FR-001, FR-009, FR-010)

```jsonc
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

- CI runs `npm test`; a non-zero exit code MUST fail the pipeline (FR-010).

## 3. Naming & location contract (FR-011)

- Logic tests: `<source>.test.ts` colocated with source.
- Component/JSX tests: `<source>.test.tsx` colocated with source.
- Shared helpers/fixtures: `src/test/`. No other test-file naming is permitted.

## 4. Structure contract for a test

- `describe("<unit name>", ...)` per unit under test.
- `it("<expected behavior in plain language>", ...)` per behavior — one logical assertion focus.
- Arrange typed fixtures (from `src/test/fixtures/`), act, assert. No `any`.

## 5. Validation-test contract (P1)

Every schema test MUST include, at minimum:
- one `expect(schema.safeParse(validInput).success).toBe(true)`;
- one rejection asserting the **specific message**, e.g.
  `expect(result.error.issues[0].message).toBe("As senhas não coincidem.")`;
- for `createCampaignSchema`: a distinct accepted case for `OFFICIAL` and for `UNOFFICIAL`, plus
  a rejection proving each channel enforces its own required fields (SC-003).

## 6. Network-isolation contract (FR-008, SC-007)

- Component tests render through `renderWithProviders` (fresh `QueryClient`, `retry:false`).
- Query hooks are mocked (`jest.mock`) or fed data through the provider; no test may issue a
  real `fetch`. A test that needs network data is wrong — mock it.

## 7. Time-determinism contract (FR-007, SC-005)

- Any test of `use-debounce`, `use-service-window`, or `calendar` date-relative behavior MUST
  call `jest.useFakeTimers()` and, where wall-clock is read, `jest.setSystemTime(fixedDate)`.
- Advance time with `jest.advanceTimersByTime(...)` inside `act(...)`; restore with
  `jest.useRealTimers()` in `afterEach`.

## Acceptance checklist for this contract

- [ ] `npm test` runs the whole suite and exits non-zero on any failure.
- [ ] `npm run test:coverage` emits a coverage summary over the three targeted trees.
- [ ] Every `src/lib/validations/*.ts` has a colocated `*.test.ts`.
- [ ] `createCampaignSchema` has passing + failing cases for both channels.
- [ ] Hook/time tests use fake timers and pass repeatably (run twice, identical result).
- [ ] No test performs a real network request.
