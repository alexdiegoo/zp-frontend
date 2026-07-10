# Implementation Plan: Procedure Catalog

**Module**: `007-procedure-catalog` | **Date**: 2026-07-10 | **Spec**: [spec.md](./spec.md)
**Status**: `migrated` — documents the implementation **as built** (commit `f8d6e2e`).

## Summary

Procedure (service) list with URL-driven pagination + debounced server search, a detail
page composed BFF-side from the catalog listing + price-history endpoint, and a create
dialog (RHF + Zod, price string → number). Mirrors the patients module in shape.

## Technical Context

**Language/Version**: TypeScript (strict), Next.js 16 App Router, React 19
**Primary Dependencies**: TanStack Query v5, TanStack Table v8 (`DataTable`), React Hook Form + Zod, shadcn/ui
**Storage**: none client-side; URL holds `page`/`q`
**Testing**: none present
**Target Platform**: Web
**Project Type**: Web application (Next.js BFF)
**Constraints**: scoped to active clinic; detail composed from two backend endpoints

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Server/Client boundary | ✅ | Server `page.tsx` files → client views (list + detail). |
| II. Route Handlers as BFF | ✅ | `api/procedures` (GET/POST), `api/procedures/[id]` (GET, composed). |
| III. TanStack Query only | ✅ | `useProcedures` (keepPreviousData), `useProcedureSearch`, `useProcedure`, `useCreateProcedure`. |
| IV. TanStack Table only | ✅ | List + price history use shared `DataTable`; columns colocated. |
| V. Paired validation | ✅ | Raw `createProcedureSchema` (form) + cleaned `procedurePayloadSchema` (server), both in the shared file; `proceduresQuerySchema` on GET. |
| VI. Strict UI composition | ✅ | `PageHeader`/`Section`, `DataTable`, skeletons, alert, dashed empty state. |
| VII. Theming via tokens | ✅ | Tokens throughout. |
| VIII. Strict TypeScript | ✅ | `Procedure`/`ProcedureDetail`/`ProcedurePrice` typed. |
| IX. Context7 | ➖ | Process gate. |
| X. Performance | ✅ | `keepPreviousData`; server pagination; 30s stale. |

No violations requiring an exception.

## Source Code (files that make up this module)

```text
src/
├── app/(app)/procedures/
│   ├── {page.tsx, view.tsx}                    # list: URL-driven pagination + search
│   ├── [id]/{page.tsx, view.tsx}               # detail: data card + price history
│   └── _components/
│       ├── columns.tsx                         # procedureColumns
│       ├── create-procedure-dialog.tsx         # RHF + zod create form
│       └── procedure-search.tsx                # standalone search input
├── hooks/queries/use-procedures.ts             # useProcedures / useProcedureSearch / useProcedure / useCreateProcedure
├── lib/validations/procedure.ts                # createProcedureSchema, cleanProcedurePayload, procedurePayloadSchema, proceduresQuerySchema
└── app/api/procedures/
    ├── route.ts                                # GET list (400) / POST create (422, 201)
    └── [id]/route.ts                           # GET detail composed from listing + prices (404)
```

**Structure Decision**: Standard route feature mirroring patients; detail composition
lives entirely in the Route Handler (the only non-trivial BFF logic here).

## Types & Schemas

- **Zod** (`lib/validations/procedure.ts`): `createProcedureSchema` → `CreateProcedureDto`
  (price as string); `cleanProcedurePayload` → `ProcedurePayload` (price as number);
  `procedurePayloadSchema` (server); `proceduresQuerySchema`.
- **API types** (`types/api.ts`): `Procedure`, `ProcedurePrice`, `ProcedureDetail`,
  `ProceduresListResponse`.

## Key implementation decisions (observed)

1. **Two-schema form pipeline** — the raw form keeps the price as a string (empty-friendly
   input); `cleanProcedurePayload` parses `"150,00" → 150`; the server re-validates the
   numeric wire shape with `procedurePayloadSchema`.
2. **BFF-composed detail** — no single-procedure backend GET, so the handler fetches the
   catalog listing (limit 100) + the price-history endpoint via `Promise.all` and merges
   them; a miss in the listing returns `404`.
3. **Active-only in comboboxes** — `useProcedureSearch` is always enabled and callers filter
   inactive procedures client-side (scheduling).

## Notes for future work

- No edit/deactivate/price-management UI; no tests.
- Detail lookup is bounded to 100 catalog entries (spec Open Question 2).
