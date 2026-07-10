# Implementation Plan: Patients (Contacts) Management

**Module**: `006-patients-contacts` | **Date**: 2026-07-10 | **Spec**: [spec.md](./spec.md)
**Status**: `migrated` — documents the implementation **as built** (commit `f8d6e2e`).

## Summary

Patient list (URL-driven pagination + debounced server search), patient detail
(profile + LTV stats + service history), and a create dialog (RHF + Zod). The BFF
forwards to the backend `customers` endpoints (backend term for patients). A second query
hook (`usePatientSearch`) serves the scheduling/campaign comboboxes off the same endpoint.

## Technical Context

**Language/Version**: TypeScript (strict), Next.js 16 App Router, React 19
**Primary Dependencies**: TanStack Query v5, TanStack Table v8 (`DataTable`), React Hook Form + Zod, shadcn/ui, lucide-react
**Storage**: none client-side; URL holds `page`/`q`
**Testing**: none present
**Target Platform**: Web
**Project Type**: Web application (Next.js BFF)
**Constraints**: scoped to active clinic; server-side search across full dataset

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Server/Client boundary | ✅ | `patients/page.tsx` + `patients/[id]/page.tsx` Server Components → client views. |
| II. Route Handlers as BFF | ✅ | `api/patients` (GET/POST), `api/patients/[id]` (GET). |
| III. TanStack Query only | ✅ | `usePatients` (keepPreviousData), `usePatientSearch`, `usePatient`, `useCreatePatient`. |
| IV. TanStack Table only | ✅ | List and service history use the shared `DataTable`; columns in `_components/columns.tsx`. |
| V. Paired validation | ✅ | `createPatientSchema` shared by dialog + POST handler; `patientsQuerySchema` on GET. Standalone search uses `safeParse` (`searchTermSchema`). |
| VI. Strict UI composition | ✅ | `PageHeader`/`Section`, `DataTable`, skeletons, destructive alert, dashed empty states. |
| VII. Theming via tokens | ✅ | Tokens throughout. |
| VIII. Strict TypeScript | ✅ | `Patient`/`PatientDetail`/`PatientsParams` typed; no `any`. |
| IX. Context7 | ➖ | Process gate. |
| X. Performance | ✅ | `keepPreviousData` avoids table flicker; 30s stale; server pagination. |

No violations requiring an exception.

## Source Code (files that make up this module)

```text
src/
├── app/(app)/patients/
│   ├── {page.tsx, view.tsx}                    # PatientsView: URL-driven list + search
│   ├── [id]/{page.tsx, view.tsx}               # PatientDetailView: stats + profile + history
│   └── _components/
│       ├── columns.tsx                         # patientColumns
│       ├── create-patient-dialog.tsx           # RHF + zod create form
│       └── patient-search.tsx                  # standalone search input
├── hooks/queries/use-patients.ts               # usePatients / usePatientSearch / usePatient / useCreatePatient
├── lib/validations/patient.ts                  # createPatientSchema, cleanPatientPayload, patientsQuerySchema
└── app/api/patients/
    ├── route.ts                                # GET list (400) / POST create (422, 201)
    └── [id]/route.ts                           # GET detail (404)
```

**Structure Decision**: Standard route feature with colocated `_components/`. `DataTable`,
`DataTablePagination`, and `contact` formatting come from shared layers.

## Types & Schemas

- **Zod** (`lib/validations/patient.ts`): `createPatientSchema` → `CreatePatientDto`;
  `cleanPatientPayload` (strips blank optionals); `patientsQuerySchema` → `PatientsQuery`.
- **API types** (`types/api.ts`): `Patient`, `PatientDetail`, `PatientServiceEntry`,
  `PatientStats`, `PatientsListResponse` (`Paginated<Patient>`).

## Key implementation decisions (observed)

1. **URL as source of truth** — `page`/`q` live in search params; `router.replace(..., {scroll:false})`; defaults (page 1, empty q) are removed from the URL.
2. **Debounced, min-2-char server search** — 400ms debounce; 1-char blocked with inline
   message; empty clears; search resets to page 1.
3. **Backend naming bridge** — the BFF forwards to `/customers` while the frontend keeps
   the domain term *patient*; POST unwraps `{ customer }` into `{ data }`.
4. **Two hooks, one endpoint** — `usePatientSearch` (≥2 chars, separate cache key) powers
   comboboxes without disturbing the table's cache.

## Notes for future work

- No edit/delete; no tests; `birthDate` unvalidated (see spec Open Questions).
