# Feature Specification: Clinic Tenancy & Application Shell

**Module**: `002-clinic-tenancy-app-shell`
**Created**: 2026-07-10
**Status**: `migrated`
**Source**: reverse-engineered from codebase + git history as of commit `f8d6e2e` (2026-07-10)

> Retroactive specification — documents existing behavior. Unclear intent is recorded
> as an Open Question rather than guessed.

## Overview

Almost every ZapBlast backend resource is scoped by a **clinic** (the backend calls it
a *company*). This module is the cross-cutting layer that (a) forces the authenticated
user to have at least one clinic before using the app, (b) tracks the **active clinic**
and re-scopes all data when it changes, and (c) renders the authenticated **application
shell** (sidebar + top bar) that hosts every `(app)` feature.

The active clinic is stored in a plain (non-httpOnly) `zapblast_clinic` cookie so both
worlds agree: the client switcher reads/writes it, and the server BFF (`resolveClinicId`)
reads it to scope every backend request. Switching clinics invalidates the entire
TanStack Query cache so all features refetch against the new tenant.

This module depends on [[001-authentication-session]] (an authenticated session must
exist first) and is depended on by every `(app)` domain module.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Enter the app scoped to a clinic (Priority: P1)

An authenticated user with clinics lands in the app shell, scoped to one active clinic.

**Why this priority**: Nothing in the CRM works without a resolved tenant; the gate is
the precondition for every other module.

**Independent Test**: Log in as a user with ≥1 clinic and confirm the sidebar/top-bar
shell renders with data scoped to the active clinic.

**Acceptance Scenarios**:

1. **Given** an authenticated user, **When** the app layout mounts, **Then** the clinic
   list is fetched and a full-screen spinner shows while loading.
2. **Given** the user has ≥1 clinic, **When** the list resolves, **Then** the app shell
   (sidebar + top bar) renders wrapped in a clinic provider whose active clinic is the
   one stored in the `zapblast_clinic` cookie, or the first clinic if none/invalid stored.
3. **Given** the clinic list request fails, **When** the error resolves, **Then** a
   retryable destructive alert ("Não foi possível carregar suas clínicas") shows with a
   "Tentar novamente" button.

### User Story 2 - Onboard the first clinic (Priority: P1)

A user with no clinics is prompted to create one before proceeding.

**Why this priority**: A brand-new account has no tenant; without this the app is
unusable for them.

**Acceptance Scenarios**:

1. **Given** the clinic list resolves empty, **When** the gate renders, **Then** the
   "cadastrar clínica" screen shows instead of the app shell.
2. **Given** the create-clinic form with a name (≥2) and category/área de atuação (≥2),
   **When** submitted, **Then** the clinic is created and the clinic list refreshes so
   the app shell can render.

### User Story 3 - Switch active clinic (Priority: P2)

A user who owns multiple clinics switches which one scopes the app.

**Why this priority**: Multi-clinic operators need to move between tenants; single-clinic
users never see it.

**Acceptance Scenarios**:

1. **Given** the clinic switcher, **When** a different clinic is selected, **Then** the
   `zapblast_clinic` cookie is updated, the active clinic state changes, and the entire
   query cache is invalidated so every feature refetches for the new tenant.
2. **Given** a re-selection of the already-active clinic, **When** chosen, **Then**
   nothing happens (no-op, no invalidation).

### User Story 4 - OAuth callback returns to the right tenant (Priority: P3)

After connecting Google/Meta, the backend's per-company success URL is translated into
this app's routing with the correct active clinic.

**Acceptance Scenarios**:

1. **Given** the browser is redirected to `/companies/:clinicId/settings?...`, **When**
   the route guard intercepts it, **Then** it rewrites to `/settings`, adopts the clinic
   from the path into the `zapblast_clinic` cookie, and forwards the OAuth result flags.

### Edge Cases

- **Stored clinic was deleted / none stored**: the provider falls back to the first
  clinic, matching the server-side default in `resolveClinicId`.
- **Server has no cookie yet**: `resolveClinicId` falls back to the user's first clinic;
  the provider also writes the cookie on mount so the next request agrees.
- **No clinics at all on the server side**: `resolveClinicId` throws `NO_CLINIC`, which
  every domain Route Handler maps to a `404` with a "Nenhuma clínica encontrada" message.
- **`useActiveClinic` used outside the provider** throws a descriptive error.
- **Protected route without a session**: `proxy.ts` redirects `/dashboard*` to `/login`.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The `(app)` layout MUST gate all authenticated content behind a clinic
  check that resolves the user's clinic list before rendering the shell.
- **FR-002**: While the clinic list loads, the gate MUST show a full-screen spinner;
  on error it MUST show a retryable destructive alert; when empty it MUST show the
  "no clinic" onboarding screen; when non-empty it MUST render the app shell.
- **FR-003**: The active clinic MUST be resolved as: the `zapblast_clinic` cookie value
  if it matches an owned clinic, otherwise the first clinic.
- **FR-004**: The active clinic id MUST be mirrored into the `zapblast_clinic` cookie
  (non-httpOnly, `path=/`, `sameSite=lax`, 1-year max-age) whenever it resolves or changes.
- **FR-005**: Switching to a different clinic MUST write the cookie, update state, and
  invalidate the entire query cache (blanket `invalidateQueries()`); switching to the
  current clinic MUST be a no-op.
- **FR-006**: The server MUST resolve the request's clinic from the `zapblast_clinic`
  cookie, falling back to the backend's first clinic, and MUST throw `NO_CLINIC` when the
  user owns none.
- **FR-007**: The clinic list query MUST be cached with a 5-minute stale time.
- **FR-008**: Creating a clinic MUST validate name (2–120) and category (2–120)
  client- and server-side with the shared schema, and invalidate the clinic list on success.
- **FR-009**: The clinics Route Handler MUST return the backend's `companies` array as
  `{ data }` on GET, and return the created `company` as `{ data }` with status `201` on
  POST (`422` on validation failure).
- **FR-010**: The application shell MUST render a fixed sidebar (220px) and a top bar
  around the routed content.
- **FR-011**: The sidebar MUST present navigation grouped as: a standalone **Dashboard**
  link; **Atendimento** (Chat, Funil, Pacientes, Procedimentos, Agenda); and **Disparos
  WhatsApp** (Campanhas, Templates), with the active item derived from the current path.
- **FR-012**: The route guard (`proxy.ts`) MUST redirect unauthenticated access to
  `/dashboard*` to `/login`, redirect authenticated users away from `/login` and
  `/register` to `/dashboard`, and treat `/` as public.
- **FR-013**: The route guard MUST translate backend OAuth success URLs
  (`/companies/:clinicId/settings`) into `/settings`, set the `zapblast_clinic` cookie
  from the path, and preserve the query flags.

### Key Entities

- **Clinic**: `{ id, name, category }` — a tenant the user owns (backend: *company*).
- **Active clinic cookie**: `zapblast_clinic` — the currently selected tenant id; holds
  no secret, readable by both client and server.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user with no clinics cannot reach any domain feature without first
  creating a clinic.
- **SC-002**: Every backend request from any feature is scoped to the same clinic the
  user last selected, surviving reloads.
- **SC-003**: Switching clinics refreshes every visible feature to the new tenant with a
  single action.
- **SC-004**: Unauthenticated navigation to a protected route always lands on `/login`.

## Explicitly Out of Scope

- **Editing or deleting a clinic** — only create and select exist.
- **Per-clinic roles/permissions** — no role model in the frontend.
- **Server-side prefetch/hydration of the clinic list** — it is fetched client-side by
  the gate (no `HydrationBoundary`).
- **Cross-tab clinic-switch sync** — a switch in one tab is not pushed to others.

## Open Questions

1. Switching clinics uses a **blanket** `invalidateQueries()` (all caches). Was a more
   targeted invalidation ever intended, or is the full reset deliberate for correctness?
2. The clinic switcher and create-clinic dialog live under `shared/clinic/`. Is clinic
   management expected to grow its own settings surface (rename, deactivate), or remain
   create-and-switch only?
3. `resolveClinicId` falls back to the first clinic when no cookie is present — is
   "first clinic" the intended default tenant, or should the user always choose explicitly?
