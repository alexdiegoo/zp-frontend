# Implementation Plan: Clinic Tenancy & Application Shell

**Module**: `002-clinic-tenancy-app-shell` | **Date**: 2026-07-10 | **Spec**: [spec.md](./spec.md)
**Status**: `migrated` — documents the implementation **as built** (commit `f8d6e2e`).

## Summary

The cross-cutting tenancy layer and authenticated shell. A `ClinicGate` in the `(app)`
layout resolves the user's clinics and renders one of: spinner, retry alert, no-clinic
onboarding, or the sidebar+topbar shell wrapped in a `ClinicProvider`. The active clinic
lives in the `zapblast_clinic` cookie, read client-side by the switcher and server-side by
`resolveClinicId` (the function every domain Route Handler calls to scope its backend
requests). A Next.js 16 `proxy.ts` guards routes and rewrites OAuth callbacks.

## Technical Context

**Language/Version**: TypeScript (strict), Next.js 16 App Router, React 19
**Primary Dependencies**: TanStack Query v5, React Context, shadcn/ui, lucide-react, React Hook Form + Zod (create-clinic dialog)
**Storage**: `zapblast_clinic` cookie (non-httpOnly, 1-year) for tenant selection
**Testing**: none present
**Target Platform**: Web (server + client components)
**Project Type**: Web application (Next.js BFF)
**Constraints**: server and client must agree on the active clinic via one shared cookie

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Server/Client boundary | ✅ | `(app)/layout.tsx` is a Server Component delegating to the `ClinicGate` client component. |
| II. Route Handlers as BFF | ✅ | `api/clinics` forwards to backend; `resolveClinicId` runs server-side only. |
| III. TanStack Query only | ✅ | `useClinics`/`useCreateClinic`; blanket invalidation on switch. |
| IV. TanStack Table only | ➖ | No tables. |
| V. Paired validation | ✅ | `createClinicSchema` shared by dialog + `api/clinics` POST. |
| VI. Strict UI composition | ✅ | shadcn primitives; shell components in `shared/layout` and `shared/clinic`. |
| VII. Theming via tokens | ✅ | `bg-sidebar-*`, `bg-background`, etc. |
| VIII. Strict TypeScript | ✅ | `Clinic` typed; context typed; no `any`. |
| IX. Context7 | ➖ | Process gate. |
| X. Performance | ✅ | Server layout; client islands only where interactive. Clinic list `staleTime` 5min. |

No violations requiring an exception.

## Source Code (files that make up this module)

```text
src/
├── app/
│   └── (app)/layout.tsx                       # renders <ClinicGate>
├── components/shared/
│   ├── clinic/
│   │   ├── clinic-gate.tsx                     # loading/error/no-clinic/shell branching
│   │   ├── clinic-provider.tsx                 # active-clinic context + switchClinic + cookie sync
│   │   ├── clinic-switcher.tsx                 # active-clinic selector
│   │   ├── create-clinic-dialog.tsx            # RHF + zod create form
│   │   └── no-clinic-screen.tsx                # onboarding screen
│   └── layout/
│       ├── sidebar.tsx                         # grouped nav (Atendimento / Disparos WhatsApp)
│       ├── topbar.tsx                          # top bar
│       └── logo.tsx
├── hooks/queries/use-clinics.ts                # useClinics / useCreateClinic (+ clinicKeys)
├── lib/
│   ├── clinic-tenant.ts                        # CLINIC_COOKIE, read/writeActiveClinicId
│   └── api/clinic.ts                           # resolveClinicId (server-only)
├── proxy.ts                                    # route guard + OAuth-callback rewrite
└── app/api/clinics/route.ts                    # GET list / POST create
```

**Structure Decision**: Tenancy is a `shared/` concern (used by the gate, switcher, and
every BFF handler), not a route feature. The `(app)` route group carries the authenticated
shell; the gate is the single entry point that all domain routes render inside.

## Types & Schemas

- **Zod** (`lib/validations/clinic.ts`): `createClinicSchema` → `CreateClinicDto`
  (name 2–120, category 2–120).
- **API types** (`types/api.ts`): `Clinic` (`{ id, name, category }`),
  `ClinicsBackendResponse` (`{ companies }`), `CreateClinicBackendResponse` (`{ company }`).

## Key implementation decisions (observed)

1. **Single shared cookie** (`zapblast_clinic`, non-httpOnly) is the source of truth for
   both the client switcher and the server `resolveClinicId`; deliberately not httpOnly
   because it holds only a clinic id the user already owns.
2. **Blanket cache invalidation on switch** — since all scoping is resolved server-side
   from the cookie, `queryClient.invalidateQueries()` (no key) refetches every feature.
3. **`NO_CLINIC` sentinel** — `resolveClinicId` throws it; every domain handler maps it to
   a `404` with a Portuguese message, giving one consistent no-tenant path.
4. **`proxy.ts` replaces `middleware.ts`** (silently ignored in Next.js 16) and also
   rewrites the backend's per-company OAuth success URL into the app's `/settings` route.
5. **Provider assumes non-empty clinics** — it is only rendered after the gate proves the
   list is non-empty, so `clinics[0]` is always safe.

## Notes for future work

- No clinic edit/delete; no tests.
- Blanket invalidation is coarse (see spec Open Question 1).
