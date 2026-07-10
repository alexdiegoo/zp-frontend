<!--
SYNC IMPACT REPORT
==================
Version change: [TEMPLATE / unversioned] → 1.0.0
Bump rationale: Initial ratification. The constitution file was still the raw
  placeholder template; this is the first concrete adoption, so MAJOR baseline 1.0.0.

Modified principles: N/A (initial adoption — no prior named principles)

Principles defined (10):
  I.    Explicit Server/Client Boundary
  II.   Route Handlers as the Mandatory BFF Layer
  III.  TanStack Query — Sole Client-Side Data Fetching
  IV.   TanStack Table — Sole Table Implementation
  V.    Paired Client + Server Validation
  VI.   Strict UI Composition
  VII.  Theming Only Through Tokens
  VIII. Strict TypeScript
  IX.   Library Documentation Always Verified (Context7)
  X.    Performance by Default

Added sections:
  - Product & Domain Context
  - Technology Stack (Fixed)
  - Naming Conventions
  - Governance

Removed sections: None (template placeholder sections replaced)

Templates requiring updates:
  ✅ .specify/templates/plan-template.md — Constitution Check gate references this file
     generically; no hardcoded principle names to change. Reviewed, aligned.
  ✅ .specify/templates/spec-template.md — no constitution-specific tokens; aligned.
  ✅ .specify/templates/tasks-template.md — task categories are illustrative and
     framework-agnostic; aligned. Frontend features should map tasks to the principle
     structure (views, route handlers, query hooks, tables, forms).
  ✅ CLAUDE.md — source of truth for the same rules; already consistent.

Follow-up TODOs: None. RATIFICATION_DATE set to adoption date 2026-07-10.
-->

# ZapBlast Frontend Constitution

ZapBlast is a **CRM for clinics** that manages the complete patient journey and powers
WhatsApp campaign dispatch at scale. This constitution governs the frontend codebase. Its
principles are non-negotiable unless a deviation is explicitly justified and recorded as an
exception (see Governance).

## Product & Domain Context

The product tracks a contact through the full patient/lead lifecycle and surfaces metrics at
every stage: **lead intake → qualification & follow-up → scheduling → procedure execution →
post-procedure & retention**. Dashboards, funnels, and reporting are first-class features.

WhatsApp campaigns are dispatched through **two channels**, which MUST be modeled explicitly
in types, forms, and UI:

- **Official API** (WhatsApp Cloud API / Business Platform) — subject to approved message
  templates, opt-in rules, and the 24-hour customer-service window.
- **Unofficial API** (session/device-based gateways) — NOT subject to template approval or
  the 24-hour window.

Code and UI MUST use clinic/CRM domain vocabulary — **lead, contact, patient, pipeline,
stage/funnel, appointment, procedure, campaign, template, channel (official/unofficial),
metric/KPI** — never generic terms like `customer` or `item`.

## Core Principles

### I. Explicit Server/Client Boundary

Every `page.tsx` MUST be a pure Server Component: its only responsibilities are exporting
`metadata`, reading server-only inputs (`params`, `searchParams`, `cookies`), optional
server-side prefetch, and rendering `<View />`. A `page.tsx` MUST NOT carry `"use client"` or
contain UI logic. Every route folder MUST contain a `view.tsx` (`"use client"`) named
`<Route>View` in PascalCase and exported as a **named export**; it builds the full UI and
fetches data via TanStack Query hooks. No page may mix these two responsibilities.

**Rationale**: A single, consistent server/client seam keeps prefetch, streaming, and the
client bundle predictable, and makes every route reviewable against one shape.

### II. Route Handlers as the Mandatory BFF Layer

No client-side code may call the real backend directly. Every request MUST go through a Next.js
Route Handler at `app/api/[resource]/route.ts`, which validates input with Zod, forwards to the
backend (passing the session token read from cookies server-side), and returns the response in
the `{ data, error, meta }` shape. Route Handlers MUST stay thin — no business logic.

**Rationale**: A BFF boundary keeps secrets and auth headers server-side, gives one place to
enforce validation and response shape, and decouples the client from backend URLs.

### III. TanStack Query — Sole Client-Side Data Fetching

Client-side data fetching MUST use TanStack Query v5. Raw `fetch`/`axios` in components and
`useEffect`-based data fetching are forbidden. Every resource has a hook in
`hooks/queries/use-*.ts` that exports a query key factory (`<resource>Keys`) for granular
invalidation. Paginated lists MUST use `placeholderData: keepPreviousData`. Components MUST
handle `isLoading`, `isError`, and empty states.

**Rationale**: One caching/invalidation model prevents ad-hoc fetching, stale UI, and flicker,
and makes cache invalidation intentional and traceable.

### IV. TanStack Table — Sole Table Implementation

No direct HTML `<table>` and no alternative table library. Every table MUST use the shared
`DataTable` base in `components/shared/data-table/`, with columns defined in a colocated
`columns.tsx` per feature. Server-side pagination, sorting, and filtering MUST be controlled
via URL params so they are shareable and survive refresh.

**Rationale**: A single table primitive guarantees consistent behavior, accessibility, and
server-driven state across every list in the product.

### V. Paired Client + Server Validation

Every form and every standalone input MUST use React Hook Form + a Zod resolver — no
exceptions. Zod schemas MUST live in `lib/validations/` and be **shared** between the form and
its Route Handler; validation logic is never duplicated. Use `mode: "onBlur"` for short forms
and `mode: "onChange"` for long forms or forms with cross-field rules. The submit button MUST be
disabled while `!form.formState.isValid || isPending`. The Route Handler MUST re-validate with
the same schema before forwarding — mandatory even when it feels redundant.

**Rationale**: Client validation is UX; server validation is security. Sharing one schema keeps
them from drifting, and a never-fires-invalid submit rule prevents bad requests at the source.

### VI. Strict UI Composition

The composition hierarchy is mandatory: shadcn primitives (`components/ui/`, never edited
manually) → `components/shared/` (used across 2+ routes) → `_components/` (scoped to a single
route) → `page.tsx`. Every page MUST use the shared `PageHeader`/`Section` layout components.
Every form field MUST go through shadcn's `FormField` wrapper. Every loading state MUST use a
`Skeleton` variant (never a spinner alone). Every empty state MUST use the shared `EmptyState`
component. Duplicating a component's structure across two files is forbidden — extract to
`components/shared/` on first repetition.

**Rationale**: A strict hierarchy prevents one-off markup, keeps the UI visually consistent, and
makes shared behavior fixable in exactly one place.

### VII. Theming Only Through Tokens

No hardcoded colors — no `bg-blue-500`, no inline hex, no `text-[#...]`. Only token classes
(`bg-primary`, `text-foreground`, `border-border`, etc.), defined in `globals.css` as CSS
variables. Adding a design color means adding a CSS variable (and its Tailwind extension) first.
Dark mode MUST be validated on every component before it is considered done.

**Rationale**: Tokens make theming and dark mode a single-source concern and keep the design
coherent as the surface area grows.

### VIII. Strict TypeScript

`strict: true` is non-negotiable. `any` is forbidden — use `unknown` and narrow via Zod or type
guards. API types live in `types/api.ts` and are preferably inferred from Zod schemas
(`z.infer`) rather than duplicated by hand. Prefer `type` for data shapes and `interface` for
component props / extendable contracts; use `satisfies` to validate without losing inference.

**Rationale**: Strict types catch domain and contract mistakes at compile time; inference from
Zod keeps runtime validation and static types in lockstep.

### IX. Library Documentation Always Verified (Context7)

Before writing or modifying code that uses TanStack Query, TanStack Table, shadcn/ui, Tailwind
v4, App Router APIs, Zod, or React Hook Form, the exact version's docs MUST be consulted via the
Context7 MCP. Never assume an API from memory. Context7 IDs: `/vercel/next.js`,
`/tanstack/query`, `/tanstack/table`, `/shadcn-ui/ui`, `/tailwindlabs/tailwindcss`,
`/colinhacks/zod`, `/react-hook-form/react-hook-form`.

**Rationale**: Version drift in these libraries has already caused hard-to-debug bugs; verifying
the actual API is cheaper than debugging a wrong assumption after it cascades.

### X. Performance by Default

Use Server Components whenever interactivity is not required. `next/image` and `next/font` are
mandatory — never a raw `<img>` or an external font `<link>`. Heavy client components (rich text
editors, charts) MUST use dynamic imports (`next/dynamic`). Never use `useEffect` for derived
state — compute it inline or with `useMemo`. Never ship large static data in the client bundle.

**Rationale**: Defaulting to the server and to lazy-loading keeps the client bundle small and
interactions fast without per-feature performance firefighting.

## Technology Stack (Fixed)

The stack is fixed and MUST NOT be changed or supplemented without a recorded exception:

- **Framework**: Next.js 16 (App Router)
- **UI**: shadcn/ui over Radix UI primitives
- **Styling**: Tailwind CSS v4
- **Data fetching**: TanStack Query v5
- **Tables**: TanStack Table v8
- **Forms**: React Hook Form v7 + Zod v4 (via `@hookform/resolvers`)
- **Language**: TypeScript (strict mode)

Adding any library that overlaps a fixed choice (a second table library, a different form or
fetching library, a CSS-in-JS runtime, etc.) is a deviation requiring justification.

## Naming Conventions

Non-negotiable:

| Item | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `CampaignTable.tsx` |
| Hooks | `use-` + kebab-case | `use-leads.ts` |
| Route Handlers | always `route.ts` | `app/api/leads/route.ts` |
| Utilities | kebab-case | `format-date.ts` |
| Types / interfaces | PascalCase | `CampaignDto`, `LeadStage` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_TEMPLATE_LENGTH` |

## Governance

This constitution supersedes other frontend conventions. It is the authoritative companion to
`CLAUDE.md`, which mirrors these rules for day-to-day implementation guidance.

**Compliance review**: Every plan and every task set generated by Spec Kit MUST be checked
against all 10 principles before approval. Any deviation — a new table library, a direct backend
call from the client, a hardcoded color, a form without Zod, a `page.tsx` with `"use client"`,
etc. — MUST be explicitly justified and recorded as an exception (in the plan's Complexity
Tracking / exceptions log). Silent deviations are not permitted. Reviewers MUST reject changes
that violate a principle without a recorded exception.

**Amendment procedure**: Amendments are proposed as a change to this file with a written
rationale, reviewed and approved by the project maintainers, and accompanied by propagation to
dependent artifacts (`CLAUDE.md`, `.specify/templates/*`) in the same change.

**Versioning policy** (semantic versioning of this document):

- **MAJOR** — backward-incompatible governance changes: removing or redefining a principle.
- **MINOR** — adding a principle or section, or materially expanding guidance.
- **PATCH** — clarifications, wording, and non-semantic refinements.

**Version**: 1.0.0 | **Ratified**: 2026-07-10 | **Last Amended**: 2026-07-10
