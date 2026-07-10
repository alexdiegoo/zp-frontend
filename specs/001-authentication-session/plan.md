# Implementation Plan: Authentication & Session

**Module**: `001-authentication-session` | **Date**: 2026-07-10 | **Spec**: [spec.md](./spec.md)
**Status**: `migrated` — documents the implementation **as built** (commit `f8d6e2e`), not a forward plan.

## Summary

Email/password login and registration for the ZapBlast CRM, plus the session
primitive the rest of the app depends on. The client renders two forms (React Hook
Form + Zod) that call thin BFF Route Handlers; the handlers re-validate, talk to the
backend via the server-only `apiClient`, and store the backend access token as an
httpOnly cookie. A global 401 handler and the `proxy.ts` route guard use that cookie
to keep the authenticated surface protected.

## Technical Context

**Language/Version**: TypeScript (strict), Next.js 16 App Router, React 19
**Primary Dependencies**: React Hook Form v7, Zod v4 (`@hookform/resolvers`), TanStack Query v5, shadcn/ui, sonner (toasts), lucide-react
**Storage**: httpOnly cookie `zapblast_token` (session token); no client persistence
**Testing**: none present in the repo (see [GAPS.md](../GAPS.md))
**Target Platform**: Web (server + client components)
**Project Type**: Web application (Next.js BFF)
**Constraints**: access token never exposed to client JS; every backend call server-side only

## Constitution Check

*Checked against the 10 principles of `.specify/memory/constitution.md`.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Server/Client boundary | ✅ | `login/page.tsx`, `register/page.tsx` are Server Components rendering `LoginView`/`RegisterView` (named-export client views). |
| II. Route Handlers as BFF | ✅ | `api/auth/{login,register,logout}` forward to backend via `apiClient`; token read/set server-side. |
| III. TanStack Query only | ✅ | `useLogin`/`useRegister`/`useLogout` are `useMutation`; no raw fetch in components. |
| IV. TanStack Table only | ➖ | No tables in this module. |
| V. Paired client + server validation | ✅ | `auth.ts` schemas shared: `loginSchema` (form + login route), `registerApiSchema` (register route). ⚠️ **Nuance**: the form uses `registerSchema` (adds `confirmPassword`) while the route uses `registerApiSchema` — same source file, no duplication, but two schemas. Not a violation. |
| VI. Strict UI composition | ⚠️ | Uses shadcn `Form`/`FormField`/`FormMessage` primitives correctly, but the auth views do **not** use the shared `PageHeader`/`Section` layout (they use the `(auth)` brand layout instead). Reasonable for auth screens; noted for GAPS. |
| VII. Theming via tokens | ✅ | `bg-brand`, `text-muted-foreground`, etc. No hardcoded colors. |
| VIII. Strict TypeScript | ✅ | No `any`; DTOs inferred from Zod via `z.infer`. |
| IX. Context7 docs | ➖ | Process gate, not verifiable from source. |
| X. Performance by default | ✅ | Pages are Server Components; views are the only client islands. |

No violations requiring a recorded exception. Minor UI-composition note carried to GAPS.

## Source Code (files that make up this module)

```text
src/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx                     # brand-panel auth shell
│   │   ├── login/{page.tsx, view.tsx}     # LoginView (client)
│   │   └── register/{page.tsx, view.tsx}  # RegisterView (client, strength meter)
│   ├── api/auth/
│   │   ├── login/route.ts                 # POST: validate → backend login → set cookie → { user }
│   │   ├── register/route.ts              # POST: validate → create + login → set cookie → { user } 201
│   │   └── logout/route.ts                # POST: clear cookie → { ok: true }
│   └── providers.tsx                      # global 401 → handleUnauthorized
├── hooks/queries/use-auth.ts              # useLogin / useRegister / useLogout (+ authKeys)
├── lib/
│   ├── validations/auth.ts                # loginSchema, registerSchema, registerApiSchema
│   ├── auth-session.ts                    # zapblast_token cookie get/set/clear
│   ├── api/api-client.ts                  # server-only backend fetch (Bearer, 401→clear)
│   └── api/http.ts                        # sendJson + HttpError + handleUnauthorized
└── proxy.ts                               # route guard on zapblast_token
```

**Structure Decision**: Follows the constitution's server/client + BFF layout exactly.
Auth is a `(auth)` route group with its own layout (no sidebar/clinic gate), distinct
from the `(app)` authenticated shell.

## Types & Schemas

- **Zod** (`lib/validations/auth.ts`): `loginSchema` → `LoginDto`; `registerSchema`
  (with cross-field `.refine` for confirmation) → `RegisterDto`; `registerApiSchema`
  → `RegisterPayload` (backend body, no confirmation).
- **API types** (`types/api.ts`): `AuthUser`, `LoginBackendResponse`
  (`{ accessToken, user }`), `RegisterBackendResponse` (`{ user }`),
  `AuthResponse` (`{ user }` — token stripped).

## Key implementation decisions (observed)

1. **Two-step register** — backend register returns no token, so the handler
   immediately re-authenticates with the same credentials to start the session.
2. **Token isolation** — `accessToken` is set as an httpOnly cookie server-side and
   stripped from every response; only `{ user }` crosses to the client.
3. **`auth: false` escape hatch** — login/register skip the Bearer header and, on a
   backend `401`, do **not** clear the cookie (a `401` there is bad credentials, not an
   expired session).
4. **Single-place 401 recovery** — `handleUnauthorized` wired through the Query/Mutation
   caches means any expired-session `401` from anywhere bounces to `/login` once.
5. **Route guard in `proxy.ts`** — Next.js 16 replaces `middleware.ts`; the exported
   `proxy` function protects `/dashboard*` and bounces authenticated users off auth pages.

## Notes for future work

- No automated tests exist for these flows (see GAPS.md).
- `authKeys.me()` is defined but unused — no current-user query is implemented.
- Password reset and email verification are not implemented (see spec Open Questions).
