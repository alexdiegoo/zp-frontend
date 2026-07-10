# Feature Specification: Authentication & Session

**Module**: `001-authentication-session`
**Created**: 2026-07-10
**Status**: `migrated`
**Source**: reverse-engineered from codebase + git history as of commit `f8d6e2e` (2026-07-10)

> This is a **retroactive** specification. It documents the behavior that already
> exists in the codebase — not desired or planned behavior. Where intent could not be
> established from code or commit messages, an **Open Question** is recorded rather
> than a guessed requirement.

## Overview

Authentication is the entry gate to the ZapBlast CRM. A clinic operator signs in
with email + password (or registers a new account) to reach the authenticated
application. The module owns three flows — **login**, **register**, **logout** —
and the **session** primitive that every other module depends on: an httpOnly
cookie holding the backend access token, forwarded server-side as a Bearer token
by the BFF layer.

It sits *before* the patient journey: no lead, campaign, or funnel surface is
reachable without an established session. The session cookie (`zapblast_token`) is
also what the route guard (`proxy.ts`) and the global 401 handler use to decide
whether a visitor is authenticated. Multi-tenant clinic selection happens *after*
login and is owned by a separate module ([[002-clinic-tenancy-app-shell]]).

The UI is Portuguese. The backend calls the user-creation endpoint `/users`; the
frontend keeps the domain term *conta* (account) / *usuário* (user).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Sign in to the CRM (Priority: P1)

An existing operator enters their email and password to reach the dashboard.

**Why this priority**: Without login there is no access to any authenticated
surface. This is the module's core value.

**Independent Test**: Submit valid credentials on `/login` and confirm redirection
to `/dashboard` with a session cookie set.

**Acceptance Scenarios**:

1. **Given** the login form with a valid email and an ≥8-char password, **When**
   the form is submitted, **Then** the backend is authenticated, the `zapblast_token`
   httpOnly cookie is set server-side, a "Bem-vindo de volta!" toast shows, and the
   browser navigates to `/dashboard`.
2. **Given** an email shorter than a valid address or a password under 8 characters,
   **When** the field is blurred, **Then** an inline validation message appears and
   the submit button stays disabled — no request is fired.
3. **Given** valid-shaped credentials the backend rejects (401/400), **When** the
   form is submitted, **Then** an error toast reads "E-mail ou senha inválidos." and
   the user stays on `/login`.
4. **Given** an already-authenticated user (cookie present), **When** they navigate
   to `/login` or `/register`, **Then** the route guard redirects them to `/dashboard`.

### User Story 2 - Create an account (Priority: P1)

A new operator registers, and is signed in immediately without a separate login.

**Why this priority**: Onboarding a new clinic account is the only way to obtain
first access; it must produce a usable session in one step.

**Independent Test**: Submit a valid registration form and confirm the user lands
authenticated on `/dashboard`.

**Acceptance Scenarios**:

1. **Given** name, email, password (≥8) and a matching confirmation, **When**
   submitted, **Then** the account is created, the same credentials are used to log
   in behind the scenes, the session cookie is set, a "Conta criada com sucesso!"
   toast shows, and the browser navigates to `/dashboard`.
2. **Given** a password and a confirmation that differ, **When** the confirmation
   field changes, **Then** an inline "As senhas não coincidem." message shows and
   submit stays disabled (form validates on change).
3. **Given** an email already registered, **When** submitted, **Then** an error toast
   reads "Este e-mail já está cadastrado." and no session is created.
4. **Given** any non-empty password, **When** typed, **Then** a strength meter shows
   "Fraca / Média / Forte" — advisory only; it does not block submission beyond the
   8-character minimum.

### User Story 3 - Sign out (Priority: P2)

An operator ends their session.

**Why this priority**: Needed for shared devices and session hygiene, but the app
is usable without ever explicitly logging out (the token expires on its own).

**Acceptance Scenarios**:

1. **Given** an authenticated user, **When** logout is invoked, **Then** the
   `zapblast_token` cookie is cleared server-side and the endpoint returns `{ ok: true }`.

### User Story 4 - Recover from an expired session (Priority: P2)

A user whose token has expired is bounced back to login from anywhere in the app.

**Why this priority**: Protects every authenticated surface from acting on a dead
token; a cross-cutting safety net rather than a user-initiated flow.

**Acceptance Scenarios**:

1. **Given** any client data request that returns `401`, **When** the response is
   received, **Then** the app hard-redirects to `/login` (via `window.location.replace`),
   except when already on `/login` or `/register`.
2. **Given** a backend `401` on an authenticated BFF request, **When** it is handled
   server-side, **Then** the session cookie is cleared before the error propagates.

### Edge Cases

- **Malformed request body** to any auth Route Handler → parsed as `null` and fails
  Zod validation with a `422` rather than throwing.
- **Register step-2 login fails** after step-1 account creation succeeds → the whole
  request surfaces the caught error; the account exists but no session is issued (the
  user would need to log in manually). See Open Questions.
- **Redirect loop protection**: the 401 handler uses a module-level `redirecting`
  flag and skips auth routes so it never clobbers the inline credential error.
- **"Esqueci minha senha" link** on the login form points to `/login` — a placeholder,
  not a working password-reset flow.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The login form MUST validate email (non-empty + valid address) and
  password (min 8 chars) client-side with `mode: "onBlur"` before enabling submit.
- **FR-002**: The login submit button MUST be disabled while the form is invalid or a
  request is pending (`!isValid || isPending`).
- **FR-003**: On successful login the system MUST show a success toast and navigate to
  `/dashboard` followed by `router.refresh()`.
- **FR-004**: On login failure the system MUST surface the Route Handler's error
  message via a toast and keep the user on `/login`.
- **FR-005**: The login password field MUST offer a show/hide toggle.
- **FR-006**: The register form MUST validate name (min 2), email, password (min 8),
  and a confirmation that matches the password, with `mode: "onChange"`.
- **FR-007**: The register form MUST show a password-strength meter (Fraca/Média/Forte)
  derived from length, upper+lower case, digit, and special-char checks, shown only when
  the password is non-empty; it MUST NOT block submission beyond the 8-char minimum.
- **FR-008**: The register form MUST forward only `{ name, email, password }` to the
  API — `confirmPassword` is UI-only and never sent.
- **FR-009**: The login Route Handler MUST re-validate the body with `loginSchema` and
  return `422` with field errors on failure.
- **FR-010**: The login Route Handler MUST call the backend `POST /users/login` with
  `auth: false`, store the returned `accessToken` as the session cookie, and return only
  `{ user }` (the token MUST NOT reach the client).
- **FR-011**: The login Route Handler MUST map backend `401`/`400` to the message
  "E-mail ou senha inválidos." (preserving the status), other errors to a generic
  message with their status, and unexpected errors to `500`.
- **FR-012**: The register Route Handler MUST re-validate with `registerApiSchema`
  (`422` on failure), then perform a two-step flow: create the account (which returns no
  token), then log in with the same credentials to obtain the token, then set the session
  cookie; it MUST return `{ user }` with status `201`.
- **FR-013**: The register Route Handler MUST map backend `409` to "Este e-mail já
  está cadastrado." (preserving status), other errors to a generic message, and
  unexpected errors to `500`.
- **FR-014**: The logout Route Handler MUST clear the session cookie and return
  `{ ok: true }`.
- **FR-015**: The session cookie MUST be named `zapblast_token`, be `httpOnly`,
  `sameSite: "lax"`, `path: "/"`, `secure` in production, and expire after 7 days.
- **FR-016**: The BFF MUST forward the session token as an `Authorization: Bearer`
  header on authenticated backend calls, and MUST skip it when a call is made with
  `auth: false` (login/register).
- **FR-017**: On any authenticated backend request returning `401`, the BFF MUST clear
  the session cookie before propagating the error; a `401` on an `auth: false` call MUST
  NOT clear the cookie (it is only bad credentials).
- **FR-018**: The client HTTP layer MUST detect a `401` from any BFF route and
  hard-redirect to `/login` via `window.location.replace`, guarded against redirect
  loops and skipped on `/login` and `/register`.
- **FR-019**: The auth query hooks (`useLogin`, `useRegister`, `useLogout`) MUST use
  the raw JSON helper (no `{ data }` unwrap) since the auth routes return `{ user }` /
  `{ ok }` directly.
- **FR-020**: Both auth pages MUST be rendered inside a shared auth layout (brand panel
  + centered form column), and each `page.tsx` MUST be a Server Component that renders
  only its client `View`.

### Key Entities

- **AuthUser**: `{ id, email, name, googleCalendarConnected }` — the authenticated
  profile returned by the backend and passed to the client (minus the token).
- **Session**: the backend `accessToken`, stored only as the `zapblast_token` httpOnly
  cookie; never serialized to the client.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user with valid credentials reaches `/dashboard` with an active
  session in a single login submission.
- **SC-002**: A new registration produces a signed-in session without a separate
  manual login step.
- **SC-003**: No auth request is ever fired from an invalid form (submit stays disabled
  until the client schema passes).
- **SC-004**: The access token is never present in any client-readable response body or
  client-readable cookie.
- **SC-005**: An expired session results in an automatic bounce to `/login` from any
  authenticated screen without a manual page reload by the user.

## Explicitly Out of Scope

- **Password reset / "forgot password"** — the link exists but targets `/login`; there
  is no reset flow.
- **SSO / OAuth account login** — email+password only. (Google/Meta OAuth exists but is
  *integration* connection, not account authentication — see [[012-integrations-settings]].)
- **"Remember me" / session-length choice** — the 7-day cookie lifetime is fixed.
- **Email verification / terms-acceptance gate at registration** — not present.
- **Client-side token refresh** — there is no refresh-token flow; an expired token
  simply bounces to login.
- **Rate limiting / lockout on failed attempts** — not handled in the frontend.

## Open Questions

1. **Register step-2 failure**: if account creation succeeds but the follow-up
   auto-login fails, the account exists but the user sees an error and no session. Is
   this partial-success path intended to be handled (e.g. bounce to `/login`), or
   accepted as-is? Code shows no special handling.
2. **"Esqueci minha senha"** points to `/login`. Is password reset a deferred feature or
   intentionally omitted?
3. **`authKeys` factory** (`authKeys.all`, `authKeys.me()`) is exported but there is no
   `me`/current-user query implemented. Was a session-hydration query planned?
4. The register password field enforces only length ≥ 8 (the strength meter is advisory).
   Is a stronger enforced policy intended, or is the meter deliberately non-blocking?
