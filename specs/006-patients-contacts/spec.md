# Feature Specification: Patients (Contacts) Management

**Module**: `006-patients-contacts`
**Created**: 2026-07-10
**Status**: `migrated`
**Source**: reverse-engineered from codebase + git history as of commit `32b0836` "feat: patients" (latest as of `f8d6e2e`, 2026-07-10)

> Retroactive specification — documents existing behavior. Unclear intent is recorded
> as an Open Question rather than guessed.

## Overview

Patients are the CRM's core contacts (the backend names them *customers*). This module
provides a paginated, searchable patient list, a patient detail page (profile + service
history + lifetime-value stats), and a create-patient dialog. Patients feed campaigns
(contact selection), scheduling (appointment patient), and chat (conversation subject).

List/search state is URL-driven (shareable, refresh-safe). Depends on
[[002-clinic-tenancy-app-shell]] for scoping.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse and find patients (Priority: P1)

An operator lists patients and searches by name.

**Why this priority**: The patient roster is the backbone the rest of the CRM references.

**Independent Test**: Open `/patients`, confirm the paginated table, then type a query and
confirm results narrow.

**Acceptance Scenarios**:

1. **Given** the patients page, **When** it loads, **Then** a table shows Nome, Telefone
   (formatted), E-mail (or "—"), and Cadastro, paginated at 20/page with the page in the URL.
2. **Given** the search box, **When** a query of ≥2 characters is entered (debounced 400ms),
   **Then** it is pushed to the URL (`?q=`), resets to page 1, and the server-side search
   applies across the whole dataset.
3. **Given** a 1-character query, **When** entered, **Then** an inline "Digite ao menos 2
   caracteres." message shows and the query is not pushed.
4. **Given** a row, **When** clicked, **Then** the browser navigates to that patient's detail.

### User Story 2 - View a patient profile (Priority: P1)

An operator opens a patient to see history and value.

**Acceptance Scenarios**:

1. **Given** a patient detail page, **When** it loads, **Then** it shows three stat tiles
   (Atendimentos, Último atendimento, LTV), a profile card (WhatsApp, e-mail, nascimento,
   origem, endereço — "—" when blank), and a service-history table.
2. **Given** a patient with no service history, **When** rendered, **Then** a dashed
   "Este paciente ainda não possui atendimentos." placeholder shows instead of the table.
3. **Given** the detail request fails or the patient is missing, **When** resolved, **Then**
   a destructive alert with a back link shows.

### User Story 3 - Register a patient (Priority: P2)

An operator adds a new patient.

**Acceptance Scenarios**:

1. **Given** the create-patient dialog with a valid name (2–255) and WhatsApp number
   (pattern), **When** submitted, **Then** the patient is created (blank optionals stripped),
   the dialog closes, a success toast shows, and patient listings are invalidated.
2. **Given** any invalid required field, **When** the form changes, **Then** inline messages
   show and submit stays disabled (`mode: "onChange"`).

### Edge Cases

- **Optional fields accept empty string** and are stripped before the request
  (`cleanPatientPayload`), so blanks are never forwarded.
- **List vs body validation status**: list query validation returns `400`; create body
  validation returns `422`.
- **Two hooks over one endpoint**: the table (`usePatients`) and the combobox lookup
  (`usePatientSearch`, used by scheduling/campaigns) both hit `/api/patients` with separate
  cache keys; the lookup is disabled below 2 characters.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The list MUST render a `DataTable` with Nome, Telefone (formatted), E-mail
  (or "—"), Cadastro; paginated at 20/page; page and query held in the URL.
- **FR-002**: Search MUST debounce input 400ms, block 1-character queries with an inline
  message, push ≥2-char (or empty) queries to `?q=`, and reset to page 1 on change.
- **FR-003**: Search MUST be server-side (applies across the full dataset, independent of
  the current page).
- **FR-004**: A row click MUST navigate to `/patients/:id`.
- **FR-005**: The detail page MUST show stats (total appointments, last appointment, LTV),
  a profile card, and a service-history table, with a dashed empty state when history is empty.
- **FR-006**: The create dialog MUST validate name (2–255) and WhatsApp
  (`^\+?[\d\s\-()]{10,20}$`) with `mode: "onChange"`, disable submit while invalid/pending,
  strip blank optionals before submit, and reset on close.
- **FR-007**: Creating a patient MUST invalidate all patient listings on success and toast.
- **FR-008**: The list query MUST use `keepPreviousData` and a 30s stale time.
- **FR-009**: The Route Handlers MUST scope to the active clinic; GET list validates
  `page`/`limit`/`q` (`400` on failure) and returns the backend `{ data, meta }` envelope;
  POST validates the body (`422`) and returns the created patient as `{ data }` (`201`);
  GET `[id]` returns `{ data }` (`404` "Paciente não encontrado."); `NO_CLINIC` → `404`.

### Key Entities

- **Patient**: `{ id, name, email, whatsappNumber, acquisitionSource, createdAt }`.
- **PatientDetail**: adds `birthDate`, `address`, `serviceHistory[]`, and `stats`
  (`totalAppointments`, `lastAppointment`, `lifetimeValue`).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An operator can find any patient by a ≥2-char name search across all pages.
- **SC-002**: A shared/refreshed patients URL restores the same page and search.
- **SC-003**: A new patient appears in the list without a manual refresh (cache invalidation).
- **SC-004**: No create request fires from an invalid form.

## Explicitly Out of Scope

- **Editing or deleting a patient** — only list, detail, and create exist.
- **Bulk actions / import** — not present.
- **Client-side sorting/column filters** — no sort handlers; only server search + pagination.
- **Birth-date format validation** — `birthDate` is an unvalidated optional string.

## Open Questions

1. There is no patient **edit** flow. Is editing deferred, or handled only backend-side?
2. `birthDate` accepts any string with no format validation — intentional or a gap?
3. The service-history table uses the shared `DataTable` with no pagination — is history
   expected to stay small, or should it paginate for long-tenured patients?
