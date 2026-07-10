# Implementation Plan: Scheduling & Calendar

**Module**: `008-scheduling-calendar` | **Date**: 2026-07-10 | **Spec**: [spec.md](./spec.md)
**Status**: `migrated` — documents the implementation **as built** (commit `f8d6e2e`).

## Summary

A week/day calendar at `/schedule` with a 30-minute slot grid, slot-click creation, a
custom pointer-based drag-to-reschedule (optimistic), a reschedule dialog, and a details
dialog for status transitions (confirm done / cancel). Patient/procedure/professional
selection uses async comboboxes. All mutations funnel through TanStack Query and invalidate
the appointments cache.

## Technical Context

**Language/Version**: TypeScript (strict), Next.js 16 App Router, React 19
**Primary Dependencies**: TanStack Query v5 (queries + optimistic mutations), React Hook Form + Zod (create/reschedule dialogs), shadcn/ui (Dialog/AlertDialog/Select), lucide-react. **No DnD library** — a bespoke pointer-drag hook.
**Storage**: none client-side; calendar window derived from local state
**Testing**: none present
**Target Platform**: Web
**Project Type**: Web application (Next.js BFF)
**Constraints**: optimistic drag with rollback; grid geometry from `lib/calendar.ts`

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Server/Client boundary | ✅ | `schedule/page.tsx` Server Component → `ScheduleView` (client orchestrator). |
| II. Route Handlers as BFF | ✅ | `api/appointments` (GET/POST), `[id]` (DELETE), `[id]/status` (PATCH), `[id]/reschedule` (PATCH), `api/professionals` (GET). |
| III. TanStack Query only | ✅ | `useAppointments` (keepPreviousData), create/status/reschedule/cancel mutations, `useProfessionals`; drag does manual `setQueriesData` + rollback. |
| IV. TanStack Table only | ➖ | Calendar grid, not a table. |
| V. Paired validation | ✅ | Raw form schemas (`createAppointmentFormSchema`, `rescheduleFormSchema`) + server wire schemas (`createAppointmentSchema`, `rescheduleAppointmentSchema`, `updateAppointmentStatusSchema`, `appointmentsQuerySchema`) all in the shared file. |
| VI. Strict UI composition | ✅ | Dialogs/comboboxes/cards composed; error alert + retry; loading skips card render. |
| VII. Theming via tokens | ✅ | Type/status color meta via tokens; `bg-primary/*`. |
| VIII. Strict TypeScript | ✅ | `Appointment`/`AppointmentType`/`AppointmentStatus`/payload types; no `any`. |
| IX. Context7 | ➖ | Process gate. |
| X. Performance | ✅ | `keepPreviousData` on window change; auto-scroll runs once; minute-tick indicator. |

No violations requiring an exception.

## Source Code (files that make up this module)

```text
src/
├── app/(app)/schedule/
│   ├── {page.tsx, view.tsx}                    # ScheduleView: state, window, drag drop, dialogs
│   └── _components/
│       ├── calendar-header.tsx                 # Hoje / prev-next / week|day toggle + range label
│       ├── week-view.tsx, day-view.tsx         # compute days → TimeGrid
│       ├── time-grid.tsx                       # slot grid, day columns, current-time line, layout
│       ├── appointment-card.tsx                # positioned card; type/status styling; DropPreview
│       ├── appointment-dialog.tsx              # create (RHF + zod)
│       ├── appointment-details-dialog.tsx      # details + confirm-done + cancel
│       ├── reschedule-dialog.tsx               # reschedule (RHF + zod)
│       ├── combobox.tsx                        # generic async search combobox
│       ├── patient-combobox.tsx                # usePatientSearch (≥2 chars)
│       ├── procedure-combobox.tsx              # useProcedureSearch (active only)
│       └── use-appointment-drag.ts             # bespoke pointer drag + edge auto-scroll
├── lib/calendar.ts                             # slot geometry, week/day helpers, layout
├── hooks/queries/use-appointments.ts           # list + create/status/reschedule/cancel
├── hooks/queries/use-professionals.ts          # professionals list
├── lib/validations/appointment.ts              # form + wire schemas (create/reschedule/status/query)
└── app/api/
    ├── appointments/route.ts                   # GET (400) / POST (422, 201)
    ├── appointments/[id]/route.ts              # DELETE (204)
    ├── appointments/[id]/status/route.ts       # PATCH (422)
    ├── appointments/[id]/reschedule/route.ts   # PATCH (422)
    └── professionals/route.ts                  # GET → { data }
```

**Structure Decision**: The largest route feature — many colocated `_components/`, a
route-local drag hook, and shared calendar geometry in `lib/`. Comboboxes reuse the
patients/procedures search hooks.

## Types & Schemas

- **Zod** (`lib/validations/appointment.ts`): `createAppointmentFormSchema` /
  `createAppointmentSchema`, `rescheduleFormSchema` / `rescheduleAppointmentSchema`,
  `updateAppointmentStatusSchema`, `appointmentsQuerySchema`; constant option/enum tuples.
- **API types** (`types/api.ts`): `Appointment`, `AppointmentType`, `AppointmentStatus`,
  `AppointmentsListResponse` (bare array), `Professional`.

## Key implementation decisions (observed)

1. **Bespoke drag** (`use-appointment-drag.ts`) instead of a DnD library — pointer capture,
   4px threshold, edge auto-scroll (rAF), slot clamping, and a click-swallow after drag.
2. **Optimistic reschedule in the view** — `setQueriesData` across all appointment windows +
   snapshot rollback, layered on top of the shared cache invalidation.
3. **Backend-contract workarounds** — `procedureId` required for every type; DONE confirmation
   forwards a price (record price or 0) so completion never 422s.
4. **Two-schema forms** — raw form schemas keep numeric fields as strings; the server
   re-validates the cleaned wire shape.
5. **Grid geometry centralized** in `lib/calendar.ts` (slot minutes/height, week anchoring,
   overlap lane layout).

## Notes for future work

- `NO_SHOW`/`IN_PROGRESS` unreachable from the UI; touch/pen drag unsupported (see spec).
- No grid skeleton/empty state; no tests.
