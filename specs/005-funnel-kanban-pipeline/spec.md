# Feature Specification: Lead/Patient Funnel — Kanban Pipeline

**Module**: `005-funnel-kanban-pipeline`
**Created**: 2026-07-10
**Status**: `migrated`
**Source**: reverse-engineered from codebase + git history as of commit `1dfd506` "feat: funil" (latest as of `f8d6e2e`, 2026-07-10)

> Retroactive specification — documents existing behavior. Unclear intent is recorded
> as an Open Question rather than guessed.

## Overview

The funnel is the CRM pipeline board at `/funnel`: a Kanban with one column per pipeline
stage and one card per patient/lead. Operators drag a card between columns to move a lead
through the patient journey. It directly models the constitution's lifecycle
(intake → qualification → scheduling → procedure done).

Stages (fixed, left-to-right):

1. `LEAD` — "Entrada / Qualificação"
2. `FOLLOW_UP` — "Follow Up"
3. `APPOINTMENT_SCHEDULED` — "Reunião Agendada"
4. `PROCEDURE_DONE` — "Procedimento Realizado"

Moves are optimistic (instant UI, rollback on error). Depends on
[[002-clinic-tenancy-app-shell]] for scoping.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See the pipeline (Priority: P1)

An operator views all leads/patients grouped by pipeline stage.

**Why this priority**: Pipeline visibility is the module's reason to exist.

**Independent Test**: Open `/funnel` and confirm four columns render with the active
clinic's cards, each column showing its card count.

**Acceptance Scenarios**:

1. **Given** the funnel, **When** it loads, **Then** four stage columns render in fixed
   order, each with a header label and a badge showing its card count.
2. **Given** a card, **When** rendered, **Then** it shows the contact's avatar (initials),
   full name, and phone number; cards in `PROCEDURE_DONE` additionally show a green accent,
   a "Concluído" badge, and a check icon.
3. **Given** the board is loading, **When** rendered, **Then** a row of column skeletons
   shows; on error a destructive alert ("Não foi possível carregar o funil") shows.

### User Story 2 - Move a lead through the pipeline (Priority: P1)

An operator drags a card to another stage.

**Why this priority**: Advancing leads is the core interaction and how metrics accrue.

**Independent Test**: Drag a card from one column to another and confirm it lands in the
new column and persists after refresh.

**Acceptance Scenarios**:

1. **Given** a card, **When** it is dragged and dropped on a different valid stage column,
   **Then** the card moves to that column immediately (optimistic) and a PATCH persists the
   new stage; on settle the board reconciles with the server.
2. **Given** a card dropped on its own current column, **When** released, **Then** nothing
   happens (no request).
3. **Given** a drop outside any valid stage column, **When** released, **Then** the move is
   ignored.
4. **Given** the persist request fails, **When** the error resolves, **Then** the optimistic
   move is rolled back to the prior board state.

### Edge Cases

- **Drag vs click**: a 4px activation distance lets clicks pass through while enabling drag.
- **Optimistic placement**: the moved card is appended to the **end** of the target column;
  `sort_order` is not applied optimistically.
- **`sort_order` unused by UI**: the schema/mutation/backend accept `sort_order`, but the
  board never sends it — there is no intra-column reordering.
- **Empty board**: all four columns still render (min-height), each with a `0` count; there
  is no dedicated empty state.
- **No transition guard**: any card may be moved to any of the four stages (backward,
  forward, or skipping) — see Open Questions.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The board MUST render exactly the four stages in fixed pipeline order, each
  as a droppable column with its human label and a live card-count badge.
- **FR-002**: Each card MUST display the contact avatar (initials), full name, and phone;
  cards in `PROCEDURE_DONE` MUST carry a "concluído" visual treatment (green accent, badge,
  check icon).
- **FR-003**: Drag-and-drop MUST use a pointer sensor with a 4px activation distance so
  ordinary clicks are not captured as drags.
- **FR-004**: A drop on a different valid stage MUST move the card to that stage; a drop on
  the same stage or outside any stage MUST be a no-op.
- **FR-005**: A move MUST be optimistic — the card relocates in cache immediately (appended
  to the target column), rolls back on error, and reconciles via board invalidation on settle.
- **FR-006**: A move MUST PATCH the move endpoint with `{ stage, sort_order? }`; the target
  stage MUST be validated as one of the four stages both client- and server-side.
- **FR-007**: The board query MUST fetch the stage-grouped board for the active clinic with
  a 30-second stale time.
- **FR-008**: The Route Handlers MUST scope to the active clinic, forward GET/PATCH to the
  backend funnel endpoints, return `{ data }`, map `NO_CLINIC` to `404`, and return `422`
  on invalid move bodies.

### Key Entities

- **FunnelStage**: one of `LEAD | FOLLOW_UP | APPOINTMENT_SCHEDULED | PROCEDURE_DONE`.
- **FunnelCard**: `{ id, patient_id, full_name, phone_number, stage, sort_order }`.
- **FunnelBoard**: cards grouped by stage (`Record<FunnelStage, FunnelCard[]>`).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All active-clinic leads appear under their current stage on load.
- **SC-002**: A dragged card appears in its new column instantly and persists across a
  refresh.
- **SC-003**: A failed move visibly reverts to the prior state.

## Explicitly Out of Scope

- **Intra-column reordering** — `sort_order` is accepted by the schema/mutation but never
  sent by the board; cards land at the column end.
- **Transition rules/guards** — no ordering constraint is enforced; any stage-to-stage move
  is allowed.
- **Creating/editing/deleting cards from the board** — the board only moves existing cards
  (leads originate elsewhere).
- **Empty-state UI** — an empty board renders bare columns with `0` counts.
- **Card detail/drill-down** — cards are not clickable to a detail view here.

## Open Questions

1. **Unrestricted transitions**: the board permits moving a card to any stage in any
   direction. Is this intentional (operators correct stages freely), or should the pipeline
   enforce forward-only / adjacent-only progression? No guard exists in code or the backend
   contract as used.
2. **`sort_order` is plumbed but unused** by the UI. Was intra-column ordering planned?
3. **No card-origin flow here** — where do funnel cards get created (backend automation on
   lead intake?) and should the board surface that?
