# Feature Specification: Integrations & Settings

**Module**: `012-integrations-settings`
**Created**: 2026-07-10
**Status**: `migrated`
**Source**: reverse-engineered from codebase + git history as of commit `678ed43` "integration section" (latest as of `f8d6e2e`, 2026-07-10)

> Retroactive specification — documents existing behavior. Unclear intent is recorded
> as an Open Question rather than guessed.

## Overview

Settings (`/settings`) is where an operator connects the clinic's external platforms. Three
integrations exist, connected two different ways:

- **Google** (Calendar sync) and **Meta** (official WhatsApp Cloud) — connected via **OAuth**:
  a full-page redirect to the provider's consent screen; the backend bounces back with success/
  error flags the settings view surfaces.
- **WhatsApp (Evolution / unofficial)** — connected via an **in-app dialog** that pairs a
  device with a QR code / pairing code, polled until linked.

Each integration card shows connected/disconnected status (with a detail line) and a connect/
disconnect action. This module enables the two WhatsApp channels that
[[010-whatsapp-campaign-dispatch]], [[011-whatsapp-template-management]], and
[[009-whatsapp-chat-conversations]] rely on. Depends on [[002-clinic-tenancy-app-shell]]
(scoping) — and the tenancy route guard rewrites the OAuth callback URLs back here.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See integration status (Priority: P1)

An operator sees which platforms are connected for the active clinic.

**Acceptance Scenarios**:

1. **Given** the settings page, **When** it loads, **Then** three cards render (Meta/official,
   Google, WhatsApp/Evolution), each showing connected/disconnected with a detail line (email,
   phone, etc.) when connected.
2. **Given** the status request fails, **When** resolved, **Then** a destructive alert shows;
   while loading, card skeletons show.
3. **Given** one provider's backend endpoint fails, **When** the aggregate status resolves,
   **Then** that provider is reported disconnected rather than blanking the whole section
   (graceful degradation).

### User Story 2 - Connect via OAuth (Google / Meta) (Priority: P1)

An operator connects an OAuth provider.

**Acceptance Scenarios**:

1. **Given** a disconnected OAuth provider, **When** "Conectar" is clicked, **Then** the
   browser is redirected (full page) to the provider's consent screen via the BFF.
2. **Given** the provider redirects back with `?<provider>_connected=true`, **When** settings
   loads, **Then** a success toast shows, the status refreshes, and the flag is cleared from the URL.
3. **Given** a failed OAuth start, **When** the BFF bounces back with `?integration_error=<provider>`,
   **Then** an error toast shows and the URL is cleaned.

### User Story 3 - Connect unofficial WhatsApp (Evolution) (Priority: P1)

An operator pairs a device for the unofficial WhatsApp channel.

**Acceptance Scenarios**:

1. **Given** the WhatsApp card, **When** "Conectar" is clicked, **Then** an in-app dialog opens
   asking for the phone number (validated).
2. **Given** a valid number, **When** "Gerar QR Code" is submitted, **Then** pairing starts and
   the dialog shows the QR code (and pairing code if provided), polling the connection every ~4s.
3. **Given** the device is linked (status open/connected/online), **When** detected, **Then** a
   success toast shows, the integration status refreshes, and the dialog closes.
4. **Given** the dialog is closed, **When** reopened, **Then** it starts a fresh pairing (form/
   pairing state reset, stale QR removed).

### User Story 4 - Disconnect an integration (Priority: P2)

An operator disconnects a connected platform.

**Acceptance Scenarios**:

1. **Given** a connected integration, **When** "Desconectar" is clicked, **Then** the provider
   is disconnected (DELETE) and the status refreshes, with a success/error toast.

### Edge Cases

- **Aggregate status uses `Promise.allSettled`** so one failing provider endpoint doesn't blank
  the section.
- **OAuth success for WhatsApp/Evolution is not URL-flag-based** — it's detected inside the
  dialog via polling + linked-status check (only google/meta use the connected-param flow).
- **QR payload normalization**: raw base64 vs full data URI both handled.
- **The route guard** (tenancy module) rewrites the backend's `/companies/:clinicId/settings`
  OAuth callback into `/settings`, adopting the clinic from the path.
- **Evolution connection polling** runs only while the dialog is open (`staleTime: 0`, 4s
  interval) and queries are removed on close to avoid a stale QR on reopen.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Settings MUST render one card per configured integration (Meta official, Google,
  WhatsApp/Evolution) with connected/disconnected status and a detail line when connected.
- **FR-002**: The aggregate status MUST be composed server-side from the Google and WhatsApp
  backend connection endpoints using `Promise.allSettled`, reporting a failed provider as
  disconnected, and normalized to `{ connected, detail }` per provider (raw payloads never reach
  the client).
- **FR-003**: Connecting an OAuth provider (`connect: "oauth"`) MUST full-page-redirect to the
  BFF OAuth-start route, which forwards to the provider's consent screen; a failed start MUST
  redirect back to `/settings?integration_error=<provider>`.
- **FR-004**: On return, `?google_connected=true`/`?meta_connected=true` MUST trigger a success
  toast, invalidate the integration status, and clear the flag; `?integration_error=<provider>`
  MUST trigger an error toast and clear the flag.
- **FR-005**: Connecting WhatsApp/Evolution (`connect: "evolution"`) MUST open an in-app dialog
  validating the phone number (`^\+?[\d\s\-()]{10,20}$`), start pairing on submit, display the
  QR/pairing code, and poll the connection every ~4s while open.
- **FR-006**: The dialog MUST detect a linked device (status in open/connected/online), toast,
  refresh status, and close; closing MUST reset form/pairing state and remove the evolution query.
- **FR-007**: Disconnecting any provider MUST call DELETE on the provider route and invalidate
  the integration status, with per-card busy state.
- **FR-008**: The Route Handlers MUST scope to the active clinic and: GET `/api/integrations`
  returns the normalized aggregate; GET/DELETE `/api/integrations/google` and `/meta` perform
  the OAuth redirect / disconnect (DELETE → `204`); `/api/integrations/whatsapp` GET returns the
  Evolution connection, POST validates the phone (`422`, `201`) and starts pairing, DELETE
  disconnects (`204`); `NO_CLINIC` → `404`.

### Key Entities

- **IntegrationProvider**: `google | meta | whatsapp`.
- **IntegrationStatus**: `{ connected, detail }` (normalized per provider).
- **IntegrationConfig**: `{ provider, name, description, icon, connect: "oauth" | "evolution" }`.
- **ChannelEvolutionConnection**: `{ status, qrCode, pairingCode, phoneNumber, profileName, ... }`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An operator can connect Google and Meta via OAuth and see the card flip to connected.
- **SC-002**: An operator can pair the unofficial WhatsApp channel via QR and see it auto-detect
  as connected.
- **SC-003**: A single failing provider endpoint never blanks the settings section.
- **SC-004**: Disconnecting a provider reflects immediately in its card.

## Explicitly Out of Scope

- **Account/profile or clinic settings beyond integrations** — the settings page currently hosts
  only the integrations section (the header says "Preferências da conta e da clínica" but no
  other settings exist yet).
- **Re-pairing status polling outside the dialog** — Evolution status is only polled while the
  connect dialog is open.
- **OAuth token management / refresh in the frontend** — handled backend-side.
- **Editing an integration's configuration** — connect/disconnect only.

## Open Questions

1. The settings header promises "preferências da conta e da clínica", but only integrations
   exist. Are account/clinic preference sections planned for this route?
2. Only google/meta use the `?<provider>_connected=true` success flow; WhatsApp relies on
   in-dialog polling. Is that asymmetry intentional (OAuth vs device pairing) and stable?
3. Evolution connection is not polled once the dialog is closed — should the settings card
   reflect live device-disconnect events without reopening the dialog?
