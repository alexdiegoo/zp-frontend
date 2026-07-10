# Implementation Plan: WhatsApp Chat / Conversations

**Module**: `009-whatsapp-chat-conversations` | **Date**: 2026-07-10 | **Spec**: [spec.md](./spec.md)
**Status**: `migrated` — documents the implementation **as built** (commit `f8d6e2e`).

## Summary

A channel-scoped WhatsApp inbox at `/chat`: conversation sidebar (polled ~10s, searchable)
+ message thread (polled ~5s, optimistic send). The 24h service window is gated for the
official Meta channel only, recomputed client-side from the server's `expiresAt` snapshot,
with a server 403 as the real backstop. Introduced across the "feat: chat" and "feat: chat
flow for api oficial" commits (the latter added all window gating).

## Technical Context

**Language/Version**: TypeScript (strict), Next.js 16 App Router, React 19
**Primary Dependencies**: TanStack Query v5 (polling + optimistic mutation), shadcn/ui, lucide-react, Zod (composer/query validation)
**Storage**: none client-side; active channel/patient in component state
**Testing**: none present
**Target Platform**: Web
**Project Type**: Web application (Next.js BFF)
**Constraints**: official-channel 24h window (client lock + server 403); polling as realtime fallback

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Server/Client boundary | ✅ | `chat/page.tsx` Server Component → `ChatView` (client orchestrator). |
| II. Route Handlers as BFF | ✅ | `api/chat/channels`, `api/chat/conversations`, `api/chat/conversations/[patientId]/messages` (GET/POST). |
| III. TanStack Query only | ✅ | `useChatChannels`/`useConversations`/`useMessages` (polling) + `useSendMessage` (optimistic). |
| IV. TanStack Table only | ➖ | No tables. |
| V. Paired validation | ✅ | `chat.ts` schemas shared: `sendMessageSchema` in composer + POST route; `conversationsQuerySchema`/`messagesQuerySchema` on GETs. |
| VI. Strict UI composition | ✅ | Sidebar/thread/composer/bubble/empty-state composed; skeletons for loading; empty/error states per pane. |
| VII. Theming via tokens | ✅ | Bubble colors and provider badges via tokens. |
| VIII. Strict TypeScript | ✅ | `types/chat.ts` (`ChatChannel`, `Conversation`, `ChatMessage`, `WindowStatus`, `MessagesPage`). |
| IX. Context7 | ➖ | Process gate. |
| X. Performance | ✅ | Window countdown recomputed with a single `setTimeout` (no polling); message/conversation polling scoped by `enabled`. |

No violations requiring an exception. Note the **400 vs 422** status split (GET query
failures → 400, POST body failure → 422) — consistent across the app; recorded in GAPS as an
app-wide convention, not a defect.

## Source Code (files that make up this module)

```text
src/
├── app/(app)/chat/
│   ├── {page.tsx, view.tsx}                    # ChatView: channel/patient state, wiring
│   └── _components/
│       ├── conversation-sidebar.tsx            # channel select (+provider badge), search, list
│       ├── conversation-item.tsx               # row: name/phone, time, preview, Você: prefix
│       ├── message-thread.tsx                  # thread; computes lockedReason/hint from window
│       ├── message-bubble.tsx                  # inbound/outbound + pending/sent icon
│       ├── message-composer.tsx                # validate + send; lock banner + countdown hint
│       ├── empty-state.tsx                     # right-pane placeholder
│       └── chat-ui.tsx                         # day/time label helpers
├── hooks/queries/use-chat.ts                   # channels/conversations/messages + useSendMessage (optimistic)
├── hooks/ui/use-service-window.ts              # local 24h window recomputation from expiresAt
├── types/chat.ts                               # chat DTOs incl. WindowStatus/MessagesPage
├── lib/validations/chat.ts                     # sendMessageSchema + query schemas
└── app/api/chat/
    ├── channels/route.ts                       # GET → { data }
    ├── conversations/route.ts                  # GET (400) → { data }
    └── conversations/[patientId]/messages/route.ts  # GET (400, full page) / POST (422, 403→window-closed, 201)
```

**Structure Decision**: Route-scoped `_components/`; the window logic is a reusable
`hooks/ui/` hook (UI-only, no network). Channels originate from the integrations module.

## Types & Schemas

- **Zod** (`lib/validations/chat.ts`): `conversationsQuerySchema`, `messagesQuerySchema`,
  `sendMessageSchema` → `SendMessageDto`.
- **Types** (`types/chat.ts`): `ChannelProvider`, `ChatChannel`, `Conversation`,
  `ChatMessage`, `WindowStatus`, `MessagesPage` (page + `windowStatus`).

## Key implementation decisions (observed)

1. **Dual 24h-window enforcement** — client composer lock (advisory, from `expiresAt`) +
   server POST 403 translated to a user-facing window-closed message (authoritative).
2. **Local window recomputation** — `useServiceWindow` ticks with a single `setTimeout` to
   the next minute/expiry; it ignores the server `isOpen` and derives state from `expiresAt`.
3. **Provider gating** — only `META_OFFICIAL` is window-gated; `EVOLUTION_UNOFFICIAL` sends
   are unconstrained; a provider badge disambiguates channels.
4. **Optimistic send** — PENDING bubble appended with `optimistic-<ts>` id; rollback on error;
   settle invalidates the thread + all conversations (order/preview refresh).
5. **Polling as realtime fallback** — conversations ~10s, messages ~5s, until SSE/WS.

## Notes for future work

- Realtime transport (SSE/WS) is the referenced next step; `"SENT"` client status is unused.
- No tests.
