# Feature Specification: WhatsApp Template Management

**Module**: `011-whatsapp-template-management`
**Created**: 2026-07-10
**Status**: `migrated`
**Source**: reverse-engineered from codebase + git history as of commits `1e9c424` "feat: templates" and `74ce874` "feat: update template" (latest as of `f8d6e2e`, 2026-07-10)

> Retroactive specification — documents existing behavior. Unclear intent is recorded
> as an Open Question rather than guessed.

## Overview

Templates are approved-message templates for the **official Meta WhatsApp API only** (the
page states this explicitly). This module manages their full lifecycle: a list of local
templates with their Meta status, a rich editor (header/body/footer/buttons/variables with
a live WhatsApp-style preview) to create and edit, submission to Meta for approval, a sync
that pulls status/content back from Meta, header-image upload, and an **AI validation
feedback** panel that flags issues before submission.

Templates feed [[010-whatsapp-campaign-dispatch]] (official campaigns pick an approved
template). Depends on [[002-clinic-tenancy-app-shell]] for scoping.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse templates and their status (Priority: P1)

An operator lists templates and sees their Meta approval status.

**Acceptance Scenarios**:

1. **Given** the templates page, **When** it loads, **Then** a table shows Nome, Categoria,
   Status (Meta lifecycle badge), Feedback IA (or "—"), Idioma, and Data de criação;
   paginated 20/page with the page in the URL.
2. **Given** a row, **When** clicked, **Then** the browser navigates to the template detail.

### User Story 2 - Create and submit a template (Priority: P1)

An operator authors a template and submits it to Meta for approval.

**Acceptance Scenarios**:

1. **Given** the editor, **When** authoring, **Then** the operator sets name (lowercase/
   digits/underscore), category (Utilidade/Marketing), an optional header (text or image),
   a body (with `{{variables}}`), optional footer, and up to 10 buttons (quick-reply/URL),
   with example values for each detected variable — all reflected in a live preview.
2. **Given** a valid form, **When** "Enviar para aprovação" is clicked, **Then** the cleaned
   payload is submitted, a success toast shows, and the browser returns to `/templates` with
   a new PENDING_REVIEW row.
3. **Given** an invalid field (e.g. bad name pattern, URL button without a valid URL, image
   header without an image), **When** rendered, **Then** inline validation blocks submit
   (`mode: "onChange"`).

### User Story 3 - Edit and re-validate a template (Priority: P2)

An operator updates a template, triggering fresh AI validation.

**Acceptance Scenarios**:

1. **Given** an existing template, **When** the edit page loads, **Then** the editor mounts
   prefilled from the stored template; **When** saved, **Then** it is updated, a "sent for new
   validation" toast shows, and the browser returns to the detail.

### User Story 4 - Read AI validation feedback (Priority: P2)

An operator reviews AI-flagged issues on a template.

**Acceptance Scenarios**:

1. **Given** a template detail, **When** the AI feedback section loads, **Then** it shows the
   run status, a summary, and per-issue rows (campo, severity Alerta/Bloqueante, descrição,
   sugestão), or an empty state when never validated; while PROCESSING it polls every ~5s.

### User Story 5 - Sync templates from Meta (Priority: P2)

An operator refreshes template status/content from Meta.

**Acceptance Scenarios**:

1. **Given** the list header "Sincronizar" button, **When** clicked, **Then** all templates
   are synced (empty body = sync-all), a count toast shows ("N sincronizado(s)" or "já estão
   atualizados"), and the listing refreshes.

### User Story 6 - Upload a header image (Priority: P3)

An operator attaches a header image to a template.

**Acceptance Scenarios**:

1. **Given** header type = Imagem, **When** a PNG/JPEG ≤5MB is chosen, **Then** an instant
   local preview shows, the editor's submit disables while uploading, and on success the
   hosted URL is set into the form; invalid type/size shows an inline error.

### Edge Cases

- **Live variable extraction is debounced** so partial `{{c}}` typing doesn't spawn throwaway
  inputs; only variables still present in the body keep example values on submit.
- **Header sentinel**: the UI offers only NONE/IMAGE; a filled text field under NONE becomes a
  TEXT header on submit.
- **Edit coercions**: on edit, VIDEO/DOCUMENT/TEXT headers collapse to NONE/IMAGE (re-saving a
  VIDEO/DOCUMENT header drops it); a non-offered category (e.g. AUTHENTICATION) falls back to
  MARKETING; language is hard-locked to `pt_BR` client-side.
- **Status codes**: list query validation → `400`; create/update body validation → `422`;
  create/update success → `202`.
- **Backend error surfacing**: create/update propagate the backend's error message (so Meta/
  backend rejections surface), while list/detail/feedback/sync use fixed generic messages.
- **Header-image upload** bypasses the JSON helper (multipart) and re-validates type/size
  server-side (`422`).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The list MUST render a `DataTable` with Nome, Categoria, Status (Meta lifecycle),
  Feedback IA (or "—"), Idioma, Data de criação; paginated 20/page; page in the URL.
- **FR-002**: The editor MUST validate name (`^[a-z0-9_]+$`, ≤512), category (UTILITY/MARKETING),
  header (NONE/IMAGE; text header ≤60 with no line breaks/emoji; image header requires an
  uploaded URL), body (1–1024), footer (≤60), and ≤10 buttons (quick-reply text ≤25; URL
  buttons require a valid http/https URL ≤2000), with per-variable example values.
- **FR-003**: The editor MUST extract `{{variables}}` live (debounced) from the body and render
  an example-value input per variable; only variables still in the body keep examples on submit.
- **FR-004**: The editor MUST render a live WhatsApp-style preview (header image/text, body with
  variables substituted by examples or highlighted, footer, buttons) as fields change.
- **FR-005**: Submit MUST be disabled while invalid, submitting, or uploading; on submit the
  form MUST be transformed to the cleaned payload (`toCreateTemplatePayload`) before sending.
- **FR-006**: Creating a template MUST submit it for Meta approval and, on success, invalidate
  the templates cache and return to `/templates`; updating MUST trigger fresh AI validation and
  invalidate list/detail/feedback.
- **FR-007**: The edit page MUST prefill the editor from the stored template
  (`toTemplateFormValues`), collapsing unsupported header types to NONE/IMAGE and unsupported
  categories to MARKETING.
- **FR-008**: The AI feedback section MUST show status/summary/issues (with severity) or an
  empty state, and MUST poll every ~5s while the run is PROCESSING; it is read-only (only an
  update triggers a new run).
- **FR-009**: The sync action MUST sync all templates (empty body), report a count via toast,
  and refresh the listing.
- **FR-010**: Header-image upload MUST accept PNG/JPEG ≤5MB, validate client-side, show a local
  preview, disable submit while uploading, and set the hosted URL on success.
- **FR-011**: The Route Handlers MUST scope to the active clinic and: GET list validates its
  query (`400`); POST create and PUT update re-validate with the server template schema
  (`422`, success `202`); GET detail/feedback return `{ data }` (`404` when missing); POST sync
  validates its body (`422`) and returns `{ syncedCount }`; POST upload validates the file
  (`422`) and returns `{ url }`; `NO_CLINIC` → `404`.

### Key Entities

- **Template**: `{ id, name, category, status, language, createdAt, aiFeedbackStatus }`.
- **TemplateDetail**: adds body/header/footer/buttons/variables (+ preview).
- **TemplateStatus**: `DRAFT | PENDING_REVIEW | APPROVED | REJECTED | PAUSED | DISABLED`.
- **TemplateAiFeedback**: `{ status, summary, issues[] , canSubmit, ... }` with issues carrying
  `campo`, `severidade (alerta|bloqueante)`, `descricao`, `sugestao`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An operator can author a compliant template with a live preview and submit it for
  Meta approval in one flow.
- **SC-002**: Template status reflects Meta's lifecycle and can be refreshed via sync.
- **SC-003**: AI feedback surfaces blocking/warning issues per field before submission and
  updates automatically while processing.
- **SC-004**: No invalid template payload reaches the backend (client + server validation).

## Explicitly Out of Scope

- **Unofficial-channel templates** — the entire feature is official-only.
- **Deleting a template** — create/edit/view/sync only.
- **Re-selecting VIDEO/DOCUMENT header types on edit** — the editor offers only NONE/IMAGE, so
  those header types are dropped on re-save.
- **AUTHENTICATION category authoring** — accepted by the server schema but not offered in the UI.
- **Multi-language authoring** — language is hard-locked to `pt_BR` in the form.
- **Triggering AI validation on demand** — validation is read-only; only an update re-runs it.
- **A `forceSubmit`/override path** — `canSubmit`/`forceSubmitted` exist in the type but no UI
  acts on them.

## Open Questions

1. On edit, VIDEO/DOCUMENT headers silently collapse to NONE/IMAGE (dropping the header) and
   AUTHENTICATION downgrades to MARKETING. Are these acceptable simplifications, or should the
   editor support those types/categories?
2. Language is hard-locked to `pt_BR` client-side though the server accepts any language and the
   display map knows en_US/es_ES. Is multi-language authoring planned?
3. `TemplateAiFeedback.canSubmit`/`forceSubmitted` are modeled but unused in the UI — was a
   "submit despite AI warnings" override intended?
