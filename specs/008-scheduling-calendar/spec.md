# Feature Specification: Scheduling & Calendar

**Module**: `008-scheduling-calendar`
**Created**: 2026-07-10
**Status**: `migrated`
**Source**: reverse-engineered from codebase + git history as of commit `9ba132a` "feat: schedule" (latest as of `f8d6e2e`, 2026-07-10)

> Retroactive specification — documents existing behavior. Unclear intent is recorded
> as an Open Question rather than guessed.

## Overview

The scheduling module (`/schedule`, "Agenda") is a week/day calendar for booking and
managing appointments — the "scheduling" stage of the patient journey. Operators click a
time slot to create an appointment, drag a card to reschedule, open a card to see details
and change status (confirm done / cancel), or reschedule via a dialog. Appointments carry
a type (consulta/procedimento/retorno), a patient, a required procedure, an optional
professional, and (for procedures) a charged price.

Depends on [[006-patients-contacts]] and [[007-procedure-catalog]] (comboboxes) and
[[002-clinic-tenancy-app-shell]] (scoping). Professionals are a supporting resource fetched
here.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View the calendar (Priority: P1)

An operator views appointments in a week or day grid.

**Why this priority**: Seeing the schedule is the base capability everything else builds on.

**Acceptance Scenarios**:

1. **Given** the calendar, **When** it loads in week mode, **Then** a 7-day grid (Sunday-
   anchored) with a 30-minute slot grid renders the active clinic's appointments for the
   visible window, positioned by start/end time.
2. **Given** the week/day toggle, prev/next, and "Hoje" controls, **When** used, **Then**
   the visible window shifts and appointments refetch for the new window.
3. **Given** overlapping appointments, **When** rendered, **Then** they split into
   side-by-side lanes so none is hidden; a red current-time line shows on today's column.
4. **Given** cancelled appointments, **When** the grid renders, **Then** they are excluded
   from display.

### User Story 2 - Create an appointment (Priority: P1)

An operator books an appointment from a time slot.

**Acceptance Scenarios**:

1. **Given** a clicked slot, **When** the create dialog opens, **Then** the start time is
   prefilled from the slot; the operator picks a type, a patient (async combobox), a
   procedure (async combobox), an optional professional, and a duration (5–600 min).
2. **Given** type = PROCEDURE, **When** a procedure is selected, **Then** the charged-price
   field appears and is prefilled from the procedure's current price; a price is required.
3. **Given** a valid form, **When** submitted, **Then** `endAt` is derived from duration,
   the appointment is created, a success toast shows, and the calendar refreshes.
4. **Given** an invalid form, **When** rendered, **Then** submit stays disabled
   (`mode: "onChange"`).

### User Story 3 - Reschedule an appointment (Priority: P1)

An operator moves an appointment to a new time — by drag or dialog.

**Acceptance Scenarios**:

1. **Given** an appointment card, **When** dragged (past a 4px threshold) to a new
   day/slot and dropped, **Then** the card moves optimistically (duration preserved), a
   reschedule PATCH persists it, and the change rolls back on error.
2. **Given** a card dropped on its current slot, **When** released, **Then** nothing happens.
3. **Given** the reschedule dialog (from details), **When** a new date/time, duration, and
   optional professional are submitted, **Then** the appointment is rescheduled and the
   calendar refreshes.

### User Story 4 - Manage an appointment's lifecycle (Priority: P2)

An operator confirms completion or cancels an appointment.

**Acceptance Scenarios**:

1. **Given** the details dialog for a SCHEDULED or IN_PROGRESS appointment, **When**
   "Confirmar realização" is clicked, **Then** the status is set to DONE with a charged
   price (falling back to 0 if none), and the calendar refreshes.
2. **Given** a non-final appointment, **When** "Cancelar agendamento" is confirmed in the
   alert dialog, **Then** the appointment is cancelled (DELETE) and removed from the grid.
3. **Given** a DONE or CANCELLED appointment, **When** the details dialog opens, **Then**
   reschedule and cancel actions are hidden.

### Edge Cases

- **Drag vs click**: a 4px move threshold distinguishes drag from click; a trailing click
  after a drag is swallowed so it does not open details.
- **Left-button only**: drag starts only on primary-button pointer-down (a doc comment says
  touch/pen too, but the code gates on button 0 — noted).
- **Slot clamp**: a dragged appointment cannot be dropped so it overflows past midnight.
- **`procedureId` required for all types** — a backend-contract workaround; even a plain
  consultation must carry a procedure, or the backend 422s.
- **DONE forces a price** — completion sends `priceCharged` from the procedure record or 0,
  so confirming never 422s on a missing price.
- **Auto-scroll on mount** positions the current time ~4 slots from the top (once).
- **Comboboxes**: patient lookup requires ≥2 chars; both debounce 300ms; the selected label
  collapses on form reset.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The calendar MUST support week (7-day, Sunday-anchored) and day views with a
  30-minute slot grid, and fetch appointments for the visible ISO window (refetching when
  the window changes, with `keepPreviousData`).
- **FR-002**: Navigation MUST provide prev/next (by week or day), a "Hoje" reset, and a
  week/day toggle; a current-time indicator MUST show on today's column and update ~every minute.
- **FR-003**: Overlapping appointments MUST be laid out in side-by-side lanes; CANCELLED
  appointments MUST be excluded from the grid.
- **FR-004**: Clicking a slot MUST open the create dialog prefilled with that slot's start time.
- **FR-005**: The create form MUST require type, patient, procedure (for every type), and
  duration (5–600 min); it MUST require a charged price only when type = PROCEDURE (enforced
  via a cross-field refinement), prefilling it from the procedure's current price.
- **FR-006**: On create, `endAt` MUST be derived from `startAt + durationMinutes`;
  `professionalId`/`notes`/`priceCharged` MUST be included only when present/applicable.
- **FR-007**: Patient and procedure selection MUST use async, debounced (300ms) comboboxes;
  patient search MUST require ≥2 characters; the procedure combobox MUST filter to active
  procedures.
- **FR-008**: Dragging a card MUST reschedule it optimistically (duration and professional
  preserved), clamped within the day, with rollback on error; a same-slot drop MUST be a no-op.
- **FR-009**: The reschedule dialog MUST accept a new datetime, duration (5–600), and optional
  professional, and persist via the reschedule endpoint (non-optimistic, relies on invalidation).
- **FR-010**: The details dialog MUST show patient, procedure, charged value, professional,
  and notes; MUST offer "Confirmar realização" only for SCHEDULED/IN_PROGRESS; MUST hide
  reschedule/cancel for DONE/CANCELLED; and MUST block closing while an action is in flight.
- **FR-011**: Confirming completion MUST set status DONE with a charged price (procedure
  record's price or 0); cancelling MUST DELETE the appointment behind an alert-dialog confirm.
- **FR-012**: Every appointment mutation (create, status, reschedule, cancel) MUST invalidate
  the entire appointments cache on success.
- **FR-013**: The Route Handlers MUST scope to the active clinic and: GET validates the
  date-window query (`400`); POST validates the create body (`422`, `201`); PATCH `.../status`
  and `.../reschedule` re-validate their bodies (`422`); DELETE returns `204`;
  GET `/professionals` returns `{ data }`; `NO_CLINIC` → `404`.

### Key Entities

- **Appointment**: `{ id, type, status, startAt, endAt, patient, procedure, professional,
  procedureRecord, notes, ... }`.
- **AppointmentType**: `CONSULTATION | PROCEDURE | RETURN`.
- **AppointmentStatus**: `SCHEDULED | IN_PROGRESS | DONE | CANCELLED | NO_SHOW`.
- **Professional**: `{ id, name, createdAt? }` — supporting resource for assignment.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An operator can book an appointment from a slot click in one dialog.
- **SC-002**: A dragged appointment moves instantly and persists across a refresh, or
  reverts on failure.
- **SC-003**: Completing an appointment never fails due to a missing charged price.
- **SC-004**: Cancelled appointments never appear on the grid.

## Explicitly Out of Scope

- **Editing appointment fields other than time/professional** (e.g. changing patient or
  procedure after creation) — not supported.
- **`NO_SHOW` / `IN_PROGRESS` transitions from the UI** — defined in the status enum/schema
  but the details dialog only triggers DONE and CANCELLED.
- **Recurring appointments** — `parentAppointmentId` exists in the type but no recurring UI.
- **A dedicated empty/loading state for the grid** — loading skips card render (no skeleton);
  an empty window shows a bare grid.
- **Touch/pen drag** — drag is gated to the primary mouse button despite a comment implying
  broader support.

## Open Questions

1. `NO_SHOW` and `IN_PROGRESS` are modeled but not reachable from the UI. Are they intended
   to be operator-settable (e.g. mark no-show), or backend-only?
2. The drag hook's comment claims touch/pen support but the code allows only button 0. Which
   is the intended behavior?
3. `procedureId` is required for all appointment types as a backend workaround. Is a true
   "no procedure" consultation intended to be supported later?
4. Completion defaults `priceCharged` to 0 when absent. Is silently charging 0 acceptable, or
   should the UI force an explicit price?
