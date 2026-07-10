# Implementation Plan: Dashboard Metrics

**Module**: `004-dashboard-metrics` | **Date**: 2026-07-10 | **Spec**: [spec.md](./spec.md)
**Status**: `migrated` — documents the implementation **as built** (commit `f8d6e2e`).

## Summary

The authenticated home at `/dashboard`: a period picker plus a four-card KPI grid
(novos leads, agendamentos, taxa de conversão, receita) for the active clinic, fetched
via TanStack Query from a thin BFF handler. Period is component-local state; changing it
re-keys the query and refetches.

## Technical Context

**Language/Version**: TypeScript (strict), Next.js 16 App Router, React 19
**Primary Dependencies**: TanStack Query v5, shadcn/ui (Card/Alert/Button), lucide-react, pt-BR Intl formatters
**Storage**: none (read-only metrics)
**Testing**: none present
**Target Platform**: Web
**Project Type**: Web application (Next.js BFF)
**Constraints**: metrics scoped to active clinic; date window passed as ISO to backend

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Server/Client boundary | ✅ | `dashboard/page.tsx` Server Component → `DashboardView` (client). |
| II. Route Handlers as BFF | ✅ | `api/dashboard` scopes clinic, forwards, returns `{ data }`. |
| III. TanStack Query only | ✅ | `useDashboardMetrics(period)`; query keyed by ISO start/end; 5-min stale. |
| IV. TanStack Table only | ➖ | No tables. |
| V. Paired validation | ⚠️ | Route Handler validates `start_date`/`end_date` presence only (not ISO format); no form here. Client builds the range in the picker. Minor. |
| VI. Strict UI composition | ✅ | `Section`/`PageHeader` not used by the tiny view, but cards/period-picker are composed shared components; skeletons used for loading. |
| VII. Theming via tokens | ✅ | `bg-primary/10`, `text-brand`, tokens throughout. |
| VIII. Strict TypeScript | ✅ | `DashboardMetrics`, `MetricFormat` typed; keys typed against the metrics shape. |
| IX. Context7 | ➖ | Process gate. |
| X. Performance | ✅ | Server page; client grid; 5-min stale avoids refetch churn. |

No violations requiring an exception.

## Source Code (files that make up this module)

```text
src/
├── app/(app)/dashboard/{page.tsx, view.tsx}   # DashboardView renders the metrics grid
├── components/dashboard/
│   ├── dashboard-config.ts                     # METRIC_CARDS_CONFIG, presets, presetToPeriod
│   ├── dashboard-metrics-grid.tsx              # owns period state; error/retry; maps cards
│   ├── metric-card.tsx                         # label/icon/value; skeleton while loading
│   └── period-picker.tsx                       # presets + custom range with validation
├── hooks/queries/use-dashboard.ts              # useDashboardMetrics (+ dashboardKeys)
└── app/api/dashboard/route.ts                  # GET: validate dates → backend → { data }
```

**Structure Decision**: Dashboard components live in `components/dashboard/` (shared
building blocks) rather than route `_components/`, reflecting their reuse-oriented design;
the route view is a thin wrapper.

## Types & Schemas

- **API types** (`types/api.ts`): `DashboardMetricValue<T>` (`{ value }`),
  `DashboardMetrics` (four keyed metrics), `DashboardMetricsResponse`
  (`{ period, metrics }`).
- **Route validation**: inline `periodSchema` (`start_date`, `end_date` non-empty strings).

## Key implementation decisions (observed)

1. **Extensible metric wrapper** — each metric is `{ value }` (not a bare number) so
   deltas/trends can be added without breaking the contract.
2. **Query key carries the ISO window** — changing the period changes the key and
   triggers a refetch automatically; no manual invalidation.
3. **Presets compute windows client-side** — `presetToPeriod` builds local-time
   boundaries; custom range enforces `end ≥ start` before firing `onChange`.
4. **Loading == undefined value** — cards render skeleton whenever the value is undefined,
   collapsing the loading and no-data states (see spec Open Question 2).

## Notes for future work

- Per-stage charts referenced in the view docstring are not built.
- Period is not URL-encoded (differs from patients/campaigns lists).
- No tests.
