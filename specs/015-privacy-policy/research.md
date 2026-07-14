# Phase 0 Research: Privacy Policy Page

**Feature**: `015-privacy-policy` | **Date**: 2026-07-13

No `NEEDS CLARIFICATION` markers remained in the spec (the two scope forks — data-deletion
mechanism and language — were resolved during `/speckit.specify`). Research below records
the technical decisions grounding the plan.

## Decision 1 — Route placement & anonymous access

- **Decision**: Add the page at `src/app/(public)/privacidade/` and reuse the existing
  `(public)/layout.tsx` unchanged.
- **Rationale**: `(public)/layout.tsx` is documented as "no sidebar, no auth guard, no
  clinic gate — reachable by anonymous visitors" and already serves the marketing landing
  page anonymously. There is **no `middleware.ts`** in the repo, so no global route guard
  exists to exclude — placement in `(public)` is sufficient to satisfy FR-001/FR-013.
- **Alternatives considered**:
  - A top-level `src/app/privacidade/` outside any group — rejected: it would inherit the
    root layout only and miss the intended public shell; the `(public)` group is the
    purpose-built home for anonymous pages.
  - Adding an auth-exclusion rule in middleware — rejected: no middleware exists and none
    is needed; introducing one is unjustified complexity.

## Decision 2 — URL / slug

- **Decision**: `/privacidade`.
- **Rationale**: Short, stable, pt-BR, and permanent — matches Meta's "stable privacy
  policy URL" requirement (FR-001, US1 scenario 3). The controlling entity can cite one
  fixed path.
- **Alternatives considered**: `/politica-de-privacidade` (more descriptive but longer);
  `/privacy` (English, inconsistent with the pt-BR audience). Either would also work; the
  slug is a low-cost decision and `/privacidade` is chosen for brevity.

## Decision 3 — Server Component vs Client Component for the view

- **Decision**: `page.tsx` and `view.tsx` are both **Server Components**; no `"use client"`.
- **Rationale**: The page is static legal copy — no state, events, or browser APIs.
  Constitution Principle X mandates Server Components when interactivity is not required,
  and the sibling `(public)/view.tsx` (landing) is already a Server Component. Recorded as
  a deviation from Principle I in the plan's Complexity Tracking.
- **Alternatives considered**: A `"use client"` view to satisfy Principle I literally —
  rejected because it ships JS for zero interactivity and contradicts Principle X.

## Decision 4 — Metadata & crawlability

- **Decision**: Export a static `Metadata` object from `page.tsx`
  (`title: "Política de Privacidade"`, a pt-BR `description`). Rely on the default indexable
  `robots` behavior (do **not** set `noindex`).
- **Rationale**: Verified via Context7 (`/vercel/next.js`): a static `metadata` object on a
  `page.tsx` is the correct Next.js 16 App Router API for a route with no dynamic params.
  Because the view is a Server Component, the full policy text is present in the server-
  rendered HTML, so an automated fetch/crawl by a Meta reviewer receives the content
  (FR-012, SC-006). No `generateMetadata` is needed (no route params / external data).
- **Alternatives considered**: `generateMetadata` — rejected: unnecessary for fully static
  metadata.

## Decision 5 — Content styling without a `prose` plugin

- **Decision**: Style the legal copy with explicit Tailwind **token classes** (headings,
  paragraphs, lists, spacing) via a route-scoped `policy-section.tsx` wrapper.
- **Rationale**: The repo does **not** include the Tailwind Typography (`prose`) plugin
  (confirmed by grep of `globals.css`). Adding a plugin would be a stack change requiring a
  recorded exception (Constitution §Technology Stack). Hand-styling with tokens keeps
  theming single-sourced (Principle VII) and dark-mode correct with no new dependency.
- **Alternatives considered**: Add `@tailwindcss/typography` — rejected: unjustified new
  dependency for a single page; violates the fixed-stack rule without sufficient benefit.

## Decision 6 — Chrome reuse (header/footer) & footer link wiring

- **Decision**: Reuse `LandingHeader` and `LandingFooter` around the policy content, and
  edit `LandingFooter` to point its existing "Política de privacidade" link from `href="#"`
  to `/privacidade`.
- **Rationale**: Gives the public page consistent navigation and branding (Principle VI,
  no duplicated chrome) and activates the already-present but dead footer link — a natural,
  low-risk integration point.
- **Alternatives considered**: A bespoke minimal header for the legal page — rejected:
  duplicates chrome and diverges visually from the rest of the public surface.

## Decision 7 — Content authorship (placeholder vs final legal copy)

- **Decision**: Ship structured, review-ready **placeholder pt-BR copy** for every required
  section, clearly authored so the business can replace the legal text without structural
  changes. Controller identity, contact channel, and effective date are surfaced as easily
  editable values.
- **Rationale**: The spec's Assumptions state final legal text is business-supplied. The
  engineering deliverable is the page structure + all required sections; copy is swappable.
- **Alternatives considered**: Block on final legal text — rejected: decouples delivery of
  the page (which unblocks Meta review structurally) from legal sign-off on wording.
