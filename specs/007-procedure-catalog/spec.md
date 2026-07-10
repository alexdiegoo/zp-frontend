# Feature Specification: Procedure Catalog

**Module**: `007-procedure-catalog`
**Created**: 2026-07-10
**Status**: `migrated`
**Source**: reverse-engineered from codebase + git history as of commit `7ce472b` "feat: procedure page" (latest as of `f8d6e2e`, 2026-07-10)

> Retroactive specification — documents existing behavior. Unclear intent is recorded
> as an Open Question rather than guessed.

## Overview

The procedure catalog is the clinic's service menu (the backend names procedures
*services* under a *catalog*). This module provides a paginated, searchable procedure
list, a procedure detail page (data + full price history), and a create-procedure dialog.
Procedures are referenced by scheduling (appointment procedure + charged price) and are
required on every appointment type.

Structurally it mirrors [[006-patients-contacts]]. Depends on
[[002-clinic-tenancy-app-shell]] for scoping.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse and find procedures (Priority: P1)

An operator lists procedures and searches by name.

**Why this priority**: The catalog underpins scheduling and pricing.

**Acceptance Scenarios**:

1. **Given** the procedures page, **When** it loads, **Then** a table shows Nome, Valor
   base (currency), Status (Ativo/Inativo badge), and Cadastro; paginated 20/page; page and
   query in the URL.
2. **Given** the search box, **When** a ≥2-char query is entered (debounced 400ms), **Then**
   it is pushed to `?q=`, resets to page 1, and searches server-side; a 1-char query is
   blocked with an inline message.
3. **Given** a row, **When** clicked, **Then** the browser navigates to that procedure's detail.

### User Story 2 - View a procedure and its price history (Priority: P1)

An operator opens a procedure to see current pricing and its history.

**Acceptance Scenarios**:

1. **Given** a procedure detail page, **When** it loads, **Then** it shows a data card
   (Valor base, Valor atual, Status, Descrição) and a price-history table (Valor, Vigente
   desde, Vigente até or "—", Situação: Vigente/Histórico).
2. **Given** the procedure is not found, **When** resolved, **Then** a destructive alert
   with a back link shows.

### User Story 3 - Register a procedure (Priority: P2)

An operator adds a new procedure.

**Acceptance Scenarios**:

1. **Given** the create dialog with a valid name (2–120) and optional base price, **When**
   submitted, **Then** the price string (`"150,00"`) is parsed to a number, blank optionals
   are dropped, the procedure is created, the dialog closes, a toast shows, and listings
   are invalidated.
2. **Given** an invalid required field, **When** the form changes, **Then** inline messages
   show and submit stays disabled (`mode: "onChange"`).

### Edge Cases

- **Two schemas**: `createProcedureSchema` validates the raw form (price as string);
  `procedurePayloadSchema` validates the cleaned wire shape (price as number) server-side.
- **Detail is BFF-composed**: the backend has no single-procedure GET, so the detail
  Route Handler composes it from the catalog listing (page 1, limit 100) + the price-history
  endpoint; a procedure absent from that first page yields a `404`.
- **List vs body validation status**: list query → `400`; create body → `422`.
- **Combobox filtering**: the scheduling combobox uses `useProcedureSearch` and filters to
  active procedures client-side.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The list MUST render a `DataTable` with Nome, Valor base (currency), Status
  (Ativo/Inativo), Cadastro; paginated 20/page; page and query in the URL.
- **FR-002**: Search MUST debounce 400ms, block 1-char queries inline, push ≥2-char/empty
  queries to `?q=`, reset to page 1, and search server-side.
- **FR-003**: A row click MUST navigate to `/procedures/:id`.
- **FR-004**: The detail page MUST show a data card and a price-history table with a
  Vigente/Histórico status per entry.
- **FR-005**: The create dialog MUST validate name (2–120) and an optional base price
  (`^\d+([.,]\d{1,2})?$`) with `mode: "onChange"`, disable submit while invalid/pending,
  parse the price to a number and drop blank optionals before submit, and reset on close.
- **FR-006**: Creating a procedure MUST invalidate all procedure listings on success and toast.
- **FR-007**: The list query MUST use `keepPreviousData` and a 30s stale time.
- **FR-008**: The detail Route Handler MUST compose the procedure from the catalog listing +
  price-history endpoint and return `404` when the id is not found in the listing.
- **FR-009**: The Route Handlers MUST scope to the active clinic; GET list validates
  `page`/`limit`/`q` (`400`); POST validates the cleaned payload (`422`) and returns the
  created procedure as `{ data }` (`201`); `NO_CLINIC` → `404`.

### Key Entities

- **Procedure**: `{ id, name, description, basePrice, currentPrice, isActive, createdAt }`.
- **ProcedurePrice**: `{ amount, effectiveFrom, effectiveTo, isCurrent, ... }`.
- **ProcedureDetail**: `Procedure` + `priceHistory[]`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An operator can find any procedure by a ≥2-char name search across all pages.
- **SC-002**: A procedure's current price and full price history are visible on its detail.
- **SC-003**: A new procedure appears in the list without a manual refresh.

## Explicitly Out of Scope

- **Editing / deactivating / deleting a procedure** — only list, detail, and create exist.
- **Managing price history from the UI** — history is read-only; new prices are not added here.
- **Client-side sorting/column filters** — server search + pagination only.

## Open Questions

1. There is no procedure **edit** or **deactivate** flow, yet `isActive` and price history
   imply lifecycle changes happen somewhere. Are those backend-only or deferred UI?
2. The detail handler scans only the first 100 catalog entries to locate a procedure — is a
   catalog >100 procedures a realistic case that would break detail lookups?
3. How are new price-history entries created (there is no add-price UI)?
