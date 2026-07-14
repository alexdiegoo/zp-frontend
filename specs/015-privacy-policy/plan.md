# Implementation Plan: Privacy Policy Page for Facebook App

**Branch**: `015-privacy-policy` | **Date**: 2026-07-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/015-privacy-policy/spec.md`

## Summary

Deliver a public, unauthenticated privacy policy page in Portuguese (pt-BR) at a stable
URL so the ZapBlast Facebook/Meta app can pass app review and satisfy LGPD. The page is
static content — no data fetching, no forms, no tables — so it is built as a **Server
Component** page under the existing `(public)` route group (which already renders anonymous
marketing pages without an auth guard). Content is organized into labeled sections
(data collected, usage, sharing, retention, LGPD rights, data-deletion instructions,
controller identity, contact, effective date) and styled with theme tokens. The existing
`LandingFooter` "Política de privacidade" link (currently `href="#"`) is wired to the new
route.

## Technical Context

**Language/Version**: TypeScript (strict), Next.js 16 App Router, React 19
**Primary Dependencies**: Next.js 16 (App Router, `Metadata` API), Tailwind CSS v4, shadcn/ui — no new dependencies
**Storage**: N/A (static content rendered server-side; no persistence)
**Testing**: Jest + React Testing Library (`next/jest`), colocated `*.test.tsx`
**Target Platform**: Web (server-rendered, mobile-first; 375px baseline)
**Project Type**: Web application (Next.js App Router frontend)
**Performance Goals**: Statically renderable; zero client-side JS for this route (no interactive islands required)
**Constraints**: Must be reachable without authentication (FR-013), crawlable by automated fetch (FR-012), no horizontal scroll at 375px (SC-005)
**Scale/Scope**: One route (`/privacidade`), one page + one view + section sub-components; ~1 legal document of copy

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Evaluated against all 10 principles (constitution v1.0.0):

| # | Principle | Status | Notes |
|---|-----------|--------|-------|
| I | Explicit Server/Client Boundary | ⚠️ Deviation (recorded) | `page.tsx` is a Server Component ✅. `view.tsx` is a **Server Component, not `"use client"`** — see Complexity Tracking. Follows the existing `(public)/view.tsx` precedent. |
| II | Route Handlers as BFF | ✅ N/A | No backend calls; static content. |
| III | TanStack Query sole fetching | ✅ N/A | No client-side data fetching. |
| IV | TanStack Table sole tables | ✅ N/A | No tables. |
| V | Paired client + server validation | ✅ N/A | No forms or standalone inputs. |
| VI | Strict UI Composition | ✅ (with note) | Reuses `LandingHeader`/`LandingFooter` and route-scoped `_components/`. Public pages compose from landing sections, not dashboard `PageHeader`/`Section` — consistent with the existing `(public)` landing page. |
| VII | Theming Only Through Tokens | ✅ | Only token classes; no hardcoded colors. Dark mode validated. |
| VIII | Strict TypeScript | ✅ | No `any`; typed content model and props. |
| IX | Library Docs Verified (Context7) | ✅ | Next.js 16 `Metadata` export confirmed via Context7 (`/vercel/next.js`) — static `metadata` object on `page.tsx` is the correct API. |
| X | Performance by Default | ✅ | Server Component, no client JS, `next/font` already global, no images. |

**Gate result**: PASS. One recorded deviation (Principle I, `view.tsx` as Server Component)
justified below; it matches the established `(public)` route-group pattern and is required
by Principle X (Server Components when no interactivity).

## Project Structure

### Documentation (this feature)

```text
specs/015-privacy-policy/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── page-contract.md # Route/UI contract for /privacidade
└── checklists/
    └── requirements.md  # From /speckit.specify
```

### Source Code (repository root)

```text
src/app/(public)/
├── layout.tsx                         # EXISTING — anonymous shell, no auth guard (reused as-is)
└── privacidade/                       # NEW route segment
    ├── page.tsx                       # NEW — Server Component shell: exports metadata, renders <PrivacyPolicyView/>
    ├── view.tsx                       # NEW — Server Component: assembles header + policy sections + footer
    └── _components/
        └── policy-section.tsx         # NEW — presentational section wrapper (heading + token-styled prose)

src/components/landing/
└── landing-footer.tsx                 # EDIT — point "Política de privacidade" link from "#" to "/privacidade"
```

**Structure Decision**: The page lives under the existing `src/app/(public)/` route group,
whose `layout.tsx` explicitly renders anonymous visitors with no auth/clinic gate — this
directly satisfies FR-001/FR-013 with no new middleware. The route follows the project's
`page.tsx` (Server Component shell) + `view.tsx` (full UI) convention, mirroring the
sibling landing page. Policy content is broken into a reusable `policy-section.tsx` wrapper
in a route-scoped `_components/` folder. No shared components are added (the section wrapper
is used only by this route); if a second legal page (e.g. Terms) later needs it, it moves to
`components/shared/`.

## Complexity Tracking

> Recorded deviations from the constitution (required by Governance §Compliance review).

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Principle I — `view.tsx` is a Server Component, not `"use client"` | The page is 100% static legal copy with no interactivity, state, or browser APIs. Principle X mandates Server Components when interactivity isn't required. A `"use client"` view would ship needless JS and contradict Principle X. | A `"use client"` view was rejected: it adds a client bundle for zero interactivity and conflicts with Principle X. The deviation is not novel — the existing `src/app/(public)/view.tsx` (landing page) is already a Server Component for the same reason, so this is the established public-route pattern, not a new one. |
