# Implementation Plan: Lead/Patient Funnel — Kanban Pipeline

**Module**: `005-funnel-kanban-pipeline` | **Date**: 2026-07-10 | **Spec**: [spec.md](./spec.md)
**Status**: `migrated` — documents the implementation **as built** (commit `f8d6e2e`).

## Summary

A four-column Kanban at `/funnel` built on `@dnd-kit/core`. Columns are droppable stages;
cards are draggable patients. `handleDragEnd` validates the drop target and calls an
optimistic move mutation (cache patch + rollback + settle-invalidation). The BFF forwards
board reads and move PATCHes to the backend funnel endpoints.

## Technical Context

**Language/Version**: TypeScript (strict), Next.js 16 App Router, React 19
**Primary Dependencies**: `@dnd-kit/core` (drag-and-drop), TanStack Query v5 (optimistic mutation), shadcn/ui, lucide-react
**Storage**: none client-side (server board is source of truth)
**Testing**: none present
**Target Platform**: Web
**Project Type**: Web application (Next.js BFF)
**Constraints**: optimistic UX with rollback; board scoped to active clinic

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Server/Client boundary | ✅ | `funnel/page.tsx` Server Component → `FunnelView` (client, holds DnD context). |
| II. Route Handlers as BFF | ✅ | `api/funnel` (GET), `api/funnel/[entryId]/move` (PATCH). |
| III. TanStack Query only | ✅ | `useFunnelBoard`, `useMoveFunnelCard` with `onMutate`/`onError`/`onSettled`. |
| IV. TanStack Table only | ➖ | Kanban, not a table — no table primitive applies. |
| V. Paired validation | ✅ | `moveCardSchema` shared by mutation body and the move Route Handler (422 on failure). |
| VI. Strict UI composition | ✅ | Column/card/avatar composed; skeleton loading; destructive alert on error. |
| VII. Theming via tokens | ✅ | Stage accent colors via tokens; `ring-ring` drop highlight. |
| VIII. Strict TypeScript | ✅ | `FunnelStage`/`FunnelCard`/`FunnelBoard`; `isFunnelStage` guard. |
| IX. Context7 | ➖ | Process gate (dnd-kit is not a constitution-listed lib). |
| X. Performance | ✅ | Optimistic update avoids refetch fl?icker; 30s stale. |

No violations requiring an exception. Note: `@dnd-kit/core` is a new dependency (added in
the "feat: funil" commit) — not overlapping any fixed stack choice, so not a deviation.

## Source Code (files that make up this module)

```text
src/
├── app/(app)/funnel/
│   ├── {page.tsx, view.tsx}                    # FunnelView: DndContext, handleDragEnd
│   └── _components/
│       ├── funnel-column.tsx                   # useDroppable per stage + count badge
│       ├── funnel-card.tsx                     # useDraggable card; PROCEDURE_DONE styling
│       └── funnel-constants.ts                 # stage labels, order, accent colors
├── components/shared/contact-avatar.tsx        # initials avatar (shared)
├── hooks/queries/use-funnel.ts                 # useFunnelBoard / useMoveFunnelCard (optimistic)
├── lib/validations/funnel.ts                   # FUNNEL_STAGES, moveCardSchema
└── app/api/funnel/
    ├── route.ts                                # GET board → { data }
    └── [entryId]/move/route.ts                 # PATCH move → { data }; 422 on invalid
```

**Structure Decision**: Route-scoped `_components/` for the board pieces; the avatar is
shared (also used by chat). Stage constants colocated with the route.

## Types & Schemas

- **Zod** (`lib/validations/funnel.ts`): `FUNNEL_STAGES` tuple; `moveCardSchema`
  (`{ stage: enum, sort_order?: coerced int ≥0 }`) → `MoveCardDto`.
- **API types** (`types/api.ts`): `FunnelStage`, `FunnelCard` (snake_case fields from
  backend), `FunnelBoard` (`Record<FunnelStage, FunnelCard[]>`).

## Key implementation decisions (observed)

1. **dnd-kit with a 4px activation distance** — preserves click-through while enabling drag.
2. **Optimistic move** — `onMutate` rebuilds the board from an empty template, relocates the
   card (append to target), snapshots `previous`; `onError` restores it; `onSettled`
   invalidates the board to reconcile.
3. **Two guards only** — drop target must be a real stage (`isFunnelStage`), and same-column
   drops are skipped; no business transition rules.
4. **`sort_order` plumbed but unsent** — schema/mutation/backend support it; the board omits
   it (no reordering).

## Notes for future work

- Decide whether transitions should be constrained (spec Open Question 1).
- Wire `sort_order` if intra-column ordering is wanted.
- No tests; no empty state.
