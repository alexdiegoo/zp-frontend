# Implementation Plan: WhatsApp Campaign Dispatch

**Module**: `010-whatsapp-campaign-dispatch` | **Date**: 2026-07-10 | **Spec**: [spec.md](./spec.md)
**Status**: `migrated` — documents the implementation **as built** (commit `f8d6e2e`).

## Summary

A URL-driven campaigns overview (per-campaign metrics over a period), a two-step builder
(channel type → OFFICIAL or UNOFFICIAL form), and a channel-aware detail view. Official
campaigns are auto-dispatched (sender number + approved template + contacts); unofficial
campaigns return a tracked message the operator copies. Channel differences are modeled as a
Zod discriminated union and distinct BFF branches.

## Technical Context

**Language/Version**: TypeScript (strict), Next.js 16 App Router, React 19
**Primary Dependencies**: TanStack Query v5, TanStack Table v8 (`DataTable`), React Hook Form + Zod (discriminated union), shadcn/ui (Select/Switch/Dropdown), lucide-react
**Storage**: none client-side; overview state in the URL; contact selection in a form-held id `Set`
**Testing**: none present
**Target Platform**: Web
**Project Type**: Web application (Next.js BFF)
**Constraints**: official vs unofficial channel modeled explicitly in types/forms/UI/BFF

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Server/Client boundary | ✅ | `campaigns/`, `campaigns/new/`, `campaigns/[id]/` pages are Server Components → client views; list/detail pages wrap views in `<Suspense>` for `useSearchParams`. |
| II. Route Handlers as BFF | ✅ | `api/campaigns` (GET/POST), `[id]` (GET), `[id]/events` (GET), `api/wa-phone-numbers` (GET). |
| III. TanStack Query only | ✅ | `useCampaigns` (keepPreviousData), `useCampaignDetail`, `useCampaignEvents`, `useCreateCampaign`, `useWaPhoneNumbers`. |
| IV. TanStack Table only | ✅ | Overview uses shared `DataTable`; columns in `_components/columns.tsx`. Note: no sorting wired. |
| V. Paired validation | ✅ | `campaign.ts` shared: `createCampaignSchema` (discriminated union) in forms + POST; `campaignsQuerySchema`/`campaignEventsQuerySchema` on GETs. |
| VI. Strict UI composition | ✅ | `PageHeader`/`Section`, `DataTable`, channel badge, previews, skeletons, alerts, empty states. |
| VII. Theming via tokens | ✅ | Revenue/brand accents via tokens; badge variants. |
| VIII. Strict TypeScript | ✅ | Discriminated `CampaignDetail`; `CampaignApiType`/`CampaignMetrics`; no `any`. |
| IX. Context7 | ➖ | Process gate. |
| X. Performance | ✅ | `keepPreviousData`; 30s stale; template preview lazy per selection. |

No violations requiring an exception.

## Source Code (files that make up this module)

```text
src/
├── app/(app)/campaigns/
│   ├── {page.tsx, view.tsx}                    # URL-driven overview (Suspense)
│   ├── _components/{campaign-filters.tsx, columns.tsx}
│   ├── new/
│   │   ├── {page.tsx, view.tsx}                # type selection → form; unofficial success screen
│   │   └── _components/{campaign-type-selector, official-campaign-form, unofficial-campaign-form, contact-picker, campaign-success}.tsx
│   └── [id]/
│       ├── {page.tsx, view.tsx}                # detail (reads ?type)
│       └── _components/{campaign-template-card, campaign-message-card}.tsx
├── components/shared/campaign/api-type-badge.tsx
├── hooks/queries/use-campaigns.ts              # list/detail/events + useCreateCampaign
├── hooks/queries/use-wa-phone-numbers.ts       # sender numbers
├── lib/validations/campaign.ts                 # query + createCampaignSchema (discriminated union)
└── app/api/
    ├── campaigns/route.ts                       # GET overview (400) / POST create (422, 201)
    ├── campaigns/[id]/route.ts                  # GET detail: OFFICIAL vs UNOFFICIAL branches
    ├── campaigns/[id]/events/route.ts           # GET events (stub-backed, unused)
    └── wa-phone-numbers/route.ts                # GET → { data }
```

**Structure Decision**: The overview, builder, and detail are separate routes with their own
`_components/`; the channel badge is shared (also conceptually tied to templates/chat).

## Types & Schemas

- **Zod** (`lib/validations/campaign.ts`): `campaignsQuerySchema`, `campaignEventsQuerySchema`,
  `createOfficialCampaignSchema` + `createUnofficialCampaignSchema` →
  `createCampaignSchema` (`discriminatedUnion("apiType")`).
- **API types** (`types/api.ts`): `CampaignOverview`/`CampaignMetrics`, `CampaignApiType`,
  `CampaignDetail` (union), `CampaignEvent`, `WaPhoneNumber`, `CreatedCampaign`.

## Key implementation decisions (observed)

1. **Channel modeled everywhere** — discriminated union in Zod, distinct forms, distinct BFF
   detail branches (`manual-campaigns/:id` vs `campaigns/:id`), distinct post-create UX
   (redirect vs copy-message screen).
2. **URL as source of truth** for the overview, with default-stripping for clean URLs and a
   page-1 reset on any filter change.
3. **Persistent contact selection** — the picker holds a flat id `Set` so selection survives
   paging/searching; the header checkbox supports an indeterminate state.
4. **Graceful template resolution** — the OFFICIAL detail degrades to a null-template empty
   state if the template fetch fails, rather than failing the page.
5. **Deferred features left inert** — read-only status switch, disabled events action, wired-
   but-unused events hook/route (backend stub).

## Notes for future work

- Pause/resume, campaign events UI, detail metrics, and sorting are unimplemented (see spec).
- Period default mismatch (`7d` UI vs `30d` Zod) to reconcile. No tests.
