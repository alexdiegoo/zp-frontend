# Quickstart: Running & Writing Unit Tests

## One-time setup

```bash
npm install -D jest jest-environment-jsdom \
  @testing-library/react @testing-library/dom @testing-library/jest-dom \
  @testing-library/user-event @types/jest ts-node
```

Then add `jest.config.ts` and `jest.setup.ts` at the repo root and the `test*` scripts to
`package.json` — see [contracts/test-conventions.md](./contracts/test-conventions.md) for the
exact contents.

## Running

```bash
npm test              # run the whole suite once
npm run test:watch    # re-run on change while developing
npm run test:coverage # suite + coverage summary
npm test -- campaign  # run only files matching "campaign"
```

Expected: suite completes in **under 30s** and is green.

## Writing a validation test (P1)

```ts
// src/lib/validations/campaign.test.ts
import { createCampaignSchema } from "./campaign";

describe("createCampaignSchema", () => {
  it("accepts a valid OFFICIAL campaign", () => {
    const result = createCampaignSchema.safeParse({
      apiType: "OFFICIAL",
      name: "Retorno pós-consulta",
      waPhoneNumberId: "wa_1",
      messageTemplateId: "tpl_1",
      contactIds: ["c_1"],
    });
    expect(result.success).toBe(true);
  });

  it("rejects an OFFICIAL campaign with no contacts", () => {
    const result = createCampaignSchema.safeParse({
      apiType: "OFFICIAL",
      name: "X",
      waPhoneNumberId: "wa_1",
      messageTemplateId: "tpl_1",
      contactIds: [],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Selecione ao menos um contato.");
    }
  });

  it("accepts a valid UNOFFICIAL campaign (message only)", () => {
    const result = createCampaignSchema.safeParse({
      apiType: "UNOFFICIAL",
      name: "Promo",
      message: "Olá! Temos novidades para você hoje.",
    });
    expect(result.success).toBe(true);
  });
});
```

## Writing a hook test with fake timers (P3)

```ts
// src/hooks/ui/use-debounce.test.ts
import { act, renderHook } from "@testing-library/react";
import { useDebounce } from "./use-debounce";

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

it("updates only after the delay elapses", () => {
  const { result, rerender } = renderHook(({ v }) => useDebounce(v, 350), {
    initialProps: { v: "a" },
  });

  rerender({ v: "b" });
  expect(result.current).toBe("a");            // not yet

  act(() => jest.advanceTimersByTime(349));
  expect(result.current).toBe("a");            // still not

  act(() => jest.advanceTimersByTime(1));
  expect(result.current).toBe("b");            // now
});
```

## Writing a component test (P4)

```tsx
// src/components/shared/data-table/data-table.test.tsx
import { render, screen } from "@testing-library/react";
import { DataTable } from "./data-table";

const columns = [{ accessorKey: "name", header: "Nome" }];

it("shows the empty message when there are no rows", () => {
  render(<DataTable columns={columns} data={[]} emptyMessage="Nenhum resultado." />);
  expect(screen.getByText("Nenhum resultado.")).toBeInTheDocument();
});

it("renders one row per item", () => {
  render(<DataTable columns={columns} data={[{ name: "Ana" }, { name: "Bruno" }]} />);
  expect(screen.getByText("Ana")).toBeInTheDocument();
  expect(screen.getByText("Bruno")).toBeInTheDocument();
});
```

For components that call TanStack Query hooks, wrap with `renderWithProviders` from
`src/test/utils.tsx` (fresh `QueryClient`, `retry:false`) or `jest.mock` the hook module and
return a typed fixture — never let a test hit the network.

## Definition of done

- [ ] `npm test` is green locally in <30s.
- [ ] Every validation schema has a colocated test (accepted + rejected).
- [ ] Both WhatsApp channels are covered in campaign schema + `ApiTypeBadge`.
- [ ] Hook/time tests pass twice in a row with identical output (no flake).
- [ ] CI runs `npm test` and blocks merge on failure.
