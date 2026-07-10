# Feature Specification: Dashboard Metrics

**Module**: `004-dashboard-metrics`
**Created**: 2026-07-10
**Status**: `migrated`
**Source**: reverse-engineered from codebase + git history as of commit `f8d6e2e` (2026-07-10)

> Retroactive specification — documents existing behavior. Unclear intent is recorded
> as an Open Question rather than guessed.

## Overview

The dashboard is the authenticated home (`/dashboard`). It surfaces four top-level KPIs
for the active clinic over a selectable time period: **novos leads**, **agendamentos**,
**taxa de conversão**, and **receita**. These map directly to the patient-journey the
product optimizes (intake → scheduling → conversion → revenue).

It is deliberately small today: a period picker plus a four-card metric grid. The route
docstring references future per-stage charts, which are not yet implemented.

Depends on [[002-clinic-tenancy-app-shell]] for tenant scoping.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See clinic KPIs at a glance (Priority: P1)

An operator opens the dashboard and reads the four KPIs for the default period.

**Why this priority**: The dashboard is the app home and the constitution names metrics a
first-class feature.

**Independent Test**: Open `/dashboard` and confirm four metric cards render with the
active clinic's values for the last 30 days.

**Acceptance Scenarios**:

1. **Given** the dashboard, **When** it mounts, **Then** it fetches metrics for the
   default period (last 30 days) and renders four cards: Novos Leads (number),
   Agendamentos (number), Taxa de Conversão (percent), Receita (currency).
2. **Given** metrics are loading or the value is undefined, **When** rendered, **Then**
   each card shows a skeleton in place of its value.
3. **Given** the metrics request fails, **When** the error resolves, **Then** a
   destructive alert ("Erro ao carregar métricas") shows with a "Tentar novamente" button.

### User Story 2 - Change the reporting period (Priority: P2)

An operator narrows or widens the KPI window.

**Why this priority**: Metrics are only meaningful against a chosen window; presets cover
the common cases and a custom range covers the rest.

**Acceptance Scenarios**:

1. **Given** the period picker, **When** a preset (7/30/90 dias) is chosen, **Then**
   metrics refetch for that window (end = now, start = now − N days at 00:00).
2. **Given** the "Personalizado" option, **When** valid start and end dates are entered,
   **Then** metrics refetch for `[start 00:00:00.000 .. end 23:59:59.999]` only if
   `end ≥ start`.
3. **Given** a custom range where the end precedes the start, **When** entered, **Then** a
   destructive validation message shows and no refetch fires.

### Edge Cases

- **Undefined vs empty data**: a null/absent metrics response leaves cards showing the
  skeleton — an undefined value is visually indistinguishable from loading (no distinct
  "no data" state).
- **Custom-range inputs** mutually constrain each other via `min`/`max` attributes.
- **Local vs UTC boundary**: the picker builds local-time boundaries but the query
  serializes them with `toISOString()` (UTC), so a boundary shift is possible by design.
- **Route Handler date validation** only checks non-empty strings, not ISO validity.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The dashboard MUST render exactly four metric cards in order: `new_leads`
  (number), `appointments` (number), `conversion_rate` (percent), `revenue` (currency),
  each with a label, icon, and description.
- **FR-002**: The default period MUST be the last 30 days; presets MUST offer 7, 30, 90
  days and a custom range.
- **FR-003**: Selecting a non-custom preset MUST immediately refetch metrics for a window
  ending now and starting N days earlier at local 00:00.
- **FR-004**: A custom range MUST use start at local 00:00:00.000 and end at local
  23:59:59.999, and MUST only apply when `end ≥ start`; otherwise show a validation
  message and suppress the refetch.
- **FR-005**: Metric values MUST be formatted per type: currency via the pt-BR currency
  formatter, percent as `N%`, number via pt-BR number formatting.
- **FR-006**: Each card MUST show a skeleton while metrics are loading or the value is
  undefined.
- **FR-007**: On error the grid MUST show a retryable destructive alert.
- **FR-008**: Metrics MUST be fetched via a query keyed by the ISO start/end so a period
  change triggers a new fetch, cached with a 5-minute stale time.
- **FR-009**: The Route Handler MUST validate presence of `start_date` and `end_date`
  (`400` when missing), scope to the active clinic, forward to the backend dashboard
  endpoint, and return `{ data }`; `NO_CLINIC` MUST map to `404`.
- **FR-010**: The period selection MUST be component-local React state (not URL-driven).

### Key Entities

- **DashboardMetrics**: `{ new_leads, appointments, conversion_rate, revenue }`, each a
  `{ value }` wrapper (extensible for future `delta`/`trend`).
- **Period**: `{ start, end }` ISO window resolved from a preset or custom range.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The four KPIs render for the active clinic within the default 30-day window
  on first load.
- **SC-002**: Changing the period updates all four cards to the new window.
- **SC-003**: An invalid custom range never triggers a metrics request.

## Explicitly Out of Scope

- **Per-stage funnel charts** — referenced in the route docstring as a placeholder for
  "upcoming per-stage charts" but not implemented.
- **Metric deltas / trends** — the response wrapper allows for them, but none are shown.
- **URL-shareable period** — the period is local state, not encoded in the URL.
- **A distinct empty/no-data state** — undefined values reuse the loading skeleton.
- **Drill-down from a KPI** — cards are display-only.

## Open Questions

1. The dashboard view docstring mentions per-stage charts. Are they a committed
   near-term feature (and should the spec anticipate them) or aspirational?
2. Undefined metric values render as skeletons indefinitely. Was a distinct empty/error
   state intended per card, or is the current behavior acceptable?
3. Period is component-local state while other lists (patients, campaigns) are URL-driven.
   Should the dashboard period also be URL-encoded for shareability/consistency?
