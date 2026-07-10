# Phase 1 Data Model: Mobile-First Styling Refactor

**Not applicable.** This is a presentation/layout-only feature. It introduces no new data
entities, fields, relationships, or state persisted to a backend, and it does not change any
existing domain model (lead, contact, patient, pipeline, appointment, procedure, campaign,
template, channel, metric).

## Ephemeral UI state (not domain data)

For completeness, the only new state introduced is transient client UI state, owned by
components and never persisted or fetched:

| State | Owner | Type | Notes |
|-------|-------|------|-------|
| Mobile nav drawer open/closed | `MobileNav` (Sheet) | `boolean` | Local `useState`; closes on route change |
| Active chat pane on mobile (list vs. thread) | `chat/view.tsx` | derived from selected conversation id | No new persisted field; reuses existing selection state |
| Current breakpoint match (only if JS branch needed) | `use-media-query` hook | `boolean` | Read-only; derived from `window.matchMedia` |

No Zod schema, Route Handler, or TanStack Query key is added or modified for this feature
(Constitution Principles II, III, V unaffected).
