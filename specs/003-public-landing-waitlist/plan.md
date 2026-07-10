# Implementation Plan: Public Landing & Waitlist

**Module**: `003-public-landing-waitlist` | **Date**: 2026-07-10 | **Spec**: [spec.md](./spec.md)
**Status**: `migrated` — documents the implementation **as built** (commit `f8d6e2e`).

## Summary

The anonymous marketing page at `/` (route group `(public)`), assembled server-side from
static sections, with a single client island — the waitlist (pré-cadastro) form. The form
validates with the shared Zod schema and simulates submission (no backend). This is the
only route group without the session guard or clinic gate.

## Technical Context

**Language/Version**: TypeScript (strict), Next.js 16 App Router, React 19
**Primary Dependencies**: Zod v4 (`safeParse`, no RHF here), shadcn/ui (Input/Button/Label), sonner, lucide-react
**Storage**: none (waitlist not persisted)
**Testing**: none present
**Target Platform**: Web (mostly static Server Components)
**Project Type**: Web application (Next.js)
**Constraints**: public/anonymous; no session or tenant

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Server/Client boundary | ✅ | `(public)/page.tsx` Server Component → `LandingView` (server) with a lone client island (`PreRegisterCta`). |
| II. Route Handlers as BFF | ➖ | No backend calls at all (simulated submit). |
| III. TanStack Query only | ➖ | No data fetching. |
| IV. TanStack Table only | ➖ | No tables. |
| V. Paired validation | ⚠️ | Uses the shared `preRegisterSchema` client-side, but via manual `useState` + `safeParse`, **not** React Hook Form, and there is no server re-validation (no backend). **Deviation from Principle V** — recorded in GAPS.md (in-code comment says the native `<form>` is intentionally avoided). |
| VI. Strict UI composition | ⚠️ | Landing sections are bespoke marketing components (not the shared `PageHeader`/`Section`), which is reasonable for a landing but noted. |
| VII. Theming via tokens | ✅ | `bg-brand`, `text-card-foreground`, etc. |
| VIII. Strict TypeScript | ✅ | `PreRegisterDto`, typed field config; no `any`. |
| IX. Context7 | ➖ | Process gate. |
| X. Performance | ✅ | Static server render; one small client island. |

**Deviation:** Principle V (RHF + paired server validation) — see Complexity Tracking.

## Source Code (files that make up this module)

```text
src/
├── app/(public)/
│   ├── layout.tsx                     # bare marketing shell (no guard/gate)
│   ├── page.tsx                       # SEO metadata → <LandingView>
│   └── view.tsx                       # LandingView (Server) assembles sections
├── components/landing/
│   ├── landing-header.tsx             # sticky header, "Entrar" → /login
│   ├── hero.tsx                       # headline + CTAs (#pre-cadastro, #recursos)
│   ├── problem-solution.tsx
│   ├── features.tsx                   # id="recursos"
│   ├── social-proof.tsx               # placeholder testimonials
│   ├── pre-register-cta.tsx           # client island: waitlist form (useState + safeParse)
│   └── landing-footer.tsx
└── lib/validations/pre-register.ts    # preRegisterSchema
```

**Structure Decision**: `(public)` route group with a minimal layout, kept entirely
separate from the authenticated `(app)` shell and `(auth)` flows.

## Types & Schemas

- **Zod** (`lib/validations/pre-register.ts`): `preRegisterSchema` → `PreRegisterDto`
  (name ≥2, clinicName ≥2, email, whatsapp regex `^\+?[\d\s\-()]{10,16}$`).

## Key implementation decisions (observed)

1. **No backend** — the waitlist is intentionally simulated (`setTimeout` ~1s) with an
   unconditional success toast; an in-code comment states this.
2. **Manual form handling** — deliberately avoids a native `<form>` and RHF, using
   `useState` for values/errors and `safeParse` on submit (Enter key wired manually).
3. **Server-first landing** — only the CTA is `"use client"`, keeping the marketing page
   static and fast.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| Waitlist form uses manual `useState`+`safeParse` instead of RHF, with no server re-validation (Principle V) | No backend endpoint exists for the waitlist yet; the form only needs to validate and show success feedback | Full RHF + a Route Handler would add a BFF/backend contract that does not exist; the team appears to have deferred persistence (see spec Open Question 1) |

## Notes for future work

- If waitlist persistence is added, migrate to RHF + a `/api/pre-register` handler with
  shared server validation to satisfy Principle V.
- Replace placeholder testimonials and the `#` privacy link before launch.
