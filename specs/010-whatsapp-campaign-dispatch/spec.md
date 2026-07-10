# Feature Specification: WhatsApp Campaign Dispatch

**Module**: `010-whatsapp-campaign-dispatch`
**Created**: 2026-07-10
**Status**: `migrated`
**Source**: reverse-engineered from codebase + git history as of commits `cc99cf9` "feat: campaign metrics" and `c5ca469` "feat: campaign details" (latest as of `f8d6e2e`, 2026-07-10)

> Retroactive specification — documents existing behavior. Unclear intent is recorded
> as an Open Question rather than guessed.

## Overview

Campaigns are WhatsApp mass dispatches to selected patients, over **two channels** that
behave differently:

- **Official (Meta API)** — auto-dispatched: pick a sender number, an **approved template**,
  and a set of contacts; the backend sends the templated messages.
- **Unofficial** — manual: write free-text; the backend returns a tracking-enabled message
  the operator copies and sends by hand.

The module provides a URL-driven campaigns overview (metrics per campaign over a period),
a two-step "new campaign" builder (channel type → channel-specific form), and a campaign
detail view. Depends on [[011-whatsapp-template-management]] (official templates),
[[006-patients-contacts]] (contact selection), and [[012-integrations-settings]]
(sender numbers).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Review campaign performance (Priority: P1)

An operator scans campaigns and their metrics.

**Why this priority**: Campaign visibility + metrics is the core of the dispatch surface.

**Acceptance Scenarios**:

1. **Given** the campaigns page, **When** it loads, **Then** a table shows each campaign's
   name (+ channel badge), status, total sent, replied (+rate), scheduled, conversions
   (+rate), and revenue, over the selected metrics period (default last 7 days), paginated
   20/page with state in the URL.
2. **Given** the filters (search ≥2 chars debounced 400ms, status, type, period), **When**
   changed, **Then** the URL updates (defaults removed for clean URLs), page resets to 1, and
   the list refetches.
3. **Given** a row, **When** clicked, **Then** the browser navigates to
   `/campaigns/:id?type=<apiType>`.

### User Story 2 - Create an official campaign (Priority: P1)

An operator dispatches an approved-template campaign to selected contacts.

**Acceptance Scenarios**:

1. **Given** the "new campaign" flow, **When** the OFFICIAL type is chosen, **Then** a form
   requires a name, a sender WhatsApp number, an approved template, and ≥1 contact.
2. **Given** the contact picker, **When** used, **Then** contacts are searched (≥2 chars,
   debounced) and multi-selected; the selection persists across pages/searches; a live count
   shows.
3. **Given** a selected template, **When** rendered, **Then** a preview of the template body
   shows.
4. **Given** a valid form, **When** submitted, **Then** the campaign is created, a success
   toast shows, and the browser navigates to `/campaigns`.

### User Story 3 - Create an unofficial campaign (Priority: P1)

An operator creates a manual campaign and copies the tracked message.

**Acceptance Scenarios**:

1. **Given** the UNOFFICIAL type, **When** chosen, **Then** the form requires only a name and
   a free-text message (10–4096 chars).
2. **Given** a valid submit, **When** created, **Then** a success screen shows the returned
   tracking-enabled message with a "Copiar mensagem" action and a warning not to alter the text.

### User Story 4 - Inspect a campaign (Priority: P2)

An operator opens a campaign to see its configuration.

**Acceptance Scenarios**:

1. **Given** an OFFICIAL campaign detail, **When** it loads, **Then** the resolved template
   is shown (fields + message preview), or an empty state if the template can't be loaded.
2. **Given** an UNOFFICIAL campaign detail, **When** it loads, **Then** the tracked message
   is shown read-only with a copy action and a "do not alter" warning.

### Edge Cases

- **Discriminated-union validation**: the create schema branches on `apiType`
  (official requires number/template/contacts; unofficial requires message).
- **Detail `type` default**: on direct/unknown access the detail page defaults to OFFICIAL.
- **Official template degrades to null**: if the campaign's template can't be fetched, the
  detail shows an empty state rather than failing.
- **Contact selection is a flat id set** so it survives paging/searching in the picker.
- **Clipboard failures are silently ignored** (insecure-context fallback).
- **Default-period mismatch (documented)**: the UI/URL-clean default period is `7d`, while
  the Route Handler's Zod default is `30d`; the client always sends `period` explicitly, so
  the Zod default only applies to direct API calls that omit it.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The overview MUST render a `DataTable` with name (+ channel badge), status,
  total sent, replied (+rate), scheduled, conversions (+rate), and revenue (currency),
  computed over the selected metrics period.
- **FR-002**: List state (page, search, status, type, period, custom dates) MUST be URL-driven,
  with default values stripped from the URL and any filter change resetting to page 1.
- **FR-003**: Search MUST debounce 400ms and block <2-char queries with an inline message.
- **FR-004**: The overview status control MUST be a read-only switch (pause/resume is not
  implemented); the row "Ver eventos" action MUST be disabled ("em breve").
- **FR-005**: The builder MUST first require choosing a channel type (OFFICIAL/UNOFFICIAL),
  then render the channel-specific form (`mode: "onChange"`, submit disabled while invalid).
- **FR-006**: The OFFICIAL form MUST require name (1–120), a sender number (from connected
  numbers), an approved template (from templates filtered to APPROVED), and ≥1 contact; it
  MUST preview the selected template's body.
- **FR-007**: The contact picker MUST search patients (≥2 chars, debounced), paginate,
  multi-select via a persistent id set, and show a live selected count.
- **FR-008**: The UNOFFICIAL form MUST require name and a message (10–4096); on success it
  MUST show a copy-the-tracked-message screen instead of redirecting.
- **FR-009**: On OFFICIAL success the builder MUST toast and navigate to `/campaigns`.
- **FR-010**: The detail page MUST read the campaign type from `?type` (defaulting to
  OFFICIAL) and render the template card (OFFICIAL, with a null-template empty state) or the
  tracked-message card (UNOFFICIAL).
- **FR-011**: Creating a campaign MUST invalidate the entire campaigns cache on success.
- **FR-012**: The Route Handlers MUST scope to the active clinic and: GET overview validates
  its query (`400`) and forwards to the backend overview endpoint; POST validates the
  discriminated-union body (`422`) and returns the created campaign (`201`); GET `[id]`
  branches on `type` (400 on invalid type; UNOFFICIAL → manual-campaign endpoint normalizing
  the tracked message; OFFICIAL → campaign endpoint resolving the template, degrading to null
  on failure); GET wa-phone-numbers returns `{ data }`; `NO_CLINIC` → `404`.

### Key Entities

- **CampaignOverview**: `{ id, name, status, apiType, metrics, createdAt }` with
  `CampaignMetrics` (sent/replied/scheduled/converted/revenue + rates).
- **CampaignApiType**: `OFFICIAL | UNOFFICIAL`.
- **CampaignDetail**: discriminated union — `OfficialCampaignDetail` (template) |
  `UnofficialCampaignDetail` (tracked message).
- **WaPhoneNumber**: a selectable official sender number.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An operator can create an official templated campaign to a chosen contact set
  in one guided flow.
- **SC-002**: An operator can create an unofficial campaign and copy its tracking-enabled
  message.
- **SC-003**: The overview reflects per-campaign metrics for the selected period, with a
  shareable/refresh-safe URL.
- **SC-004**: The channel type visibly and functionally changes the required inputs and the
  post-create outcome.

## Explicitly Out of Scope

- **Pausing/resuming a campaign** — the status switch is read-only (out of scope per code).
- **Campaign events drill-down** — the events hook and Route Handler exist but are unused
  (backend stub); the row action is disabled.
- **Metrics on the detail page** — the detail shows configuration only, no metrics.
- **Editing/deleting a campaign** — create + view only.
- **Sorting** — no client/URL sorting on the overview.
- **Scheduling a future send time** — no schedule picker in the builder.

## Open Questions

1. Pause/resume is explicitly out of scope in code (read-only switch). Is it a planned
   feature, and should the status model support more than ACTIVE/PAUSED?
2. The **events** timeline is fully wired (hook + route) but backed by a backend stub and
   surfaced nowhere (disabled menu item). Is the per-contact event drill-down committed?
3. The detail page shows no metrics though the overview does. Should campaign detail surface
   its own metrics/timeline?
4. Period default differs between the UI (`7d`) and the Route Handler's Zod default (`30d`).
   Which is authoritative?
