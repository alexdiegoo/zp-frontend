# Feature Specification: WhatsApp Chat / Conversations

**Module**: `009-whatsapp-chat-conversations`
**Created**: 2026-07-10
**Status**: `migrated`
**Source**: reverse-engineered from codebase + git history as of commits `9f5cb0a` "feat: chat" and `01e47dc` "feat: chat flow for api oficial" (latest as of `f8d6e2e`, 2026-07-10)

> Retroactive specification — documents existing behavior. Unclear intent is recorded
> as an Open Question rather than guessed.

## Overview

The chat module (`/chat`) is a WhatsApp inbox: a channel-scoped list of conversations
(grouped by patient) and a message thread with a composer for outbound replies. It powers
one-to-one patient communication across both WhatsApp channels.

The defining behavior is the **24-hour customer-service window**: on the **official Meta**
channel, free-form outbound messages are only allowed within 24h of the patient's last
inbound message. The composer is locked (with a live countdown) when the window is closed;
the **unofficial (Evolution)** channel is never gated. Enforcement is dual — a client-side
lock (advisory) and a server-side 403 backstop.

A "conversation" is a client/DTO grouping of messages by patient; there is no conversation
entity on the backend. Depends on [[012-integrations-settings]] (channels come from
connected integrations) and [[002-clinic-tenancy-app-shell]] (scoping).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Triage conversations (Priority: P1)

An operator scans conversations for a channel and opens one.

**Why this priority**: The inbox is the module's home surface.

**Acceptance Scenarios**:

1. **Given** the chat page with ≥1 connected channel, **When** it loads, **Then** the first
   channel is active by default and its conversations list (patient name/phone, last-message
   time, preview, "Você:" prefix for outbound) renders, polling every ~10s.
2. **Given** more than one channel, **When** the channel selector is used, **Then** the
   conversations reload for the chosen channel and the open thread is cleared; the selector
   shows an Oficial/Não oficial badge per channel.
3. **Given** the search box, **When** a query is typed (debounced 350ms), **Then**
   conversations filter by name/phone server-side.
4. **Given** no connected channels, **When** the page loads, **Then** a full-page empty state
   prompts connecting a WhatsApp channel in settings.

### User Story 2 - Read a thread (Priority: P1)

An operator opens a conversation and reads its messages.

**Acceptance Scenarios**:

1. **Given** a selected conversation, **When** the thread loads, **Then** messages render as
   inbound/outbound bubbles with day separators (Hoje/Ontem/date), auto-scrolled to the
   latest, polling every ~5s.
2. **Given** an outbound message, **When** rendered, **Then** it shows a status icon
   (sending/clock while pending, sent/check otherwise).

### User Story 3 - Send a reply within the window (Priority: P1)

An operator sends an outbound message.

**Acceptance Scenarios**:

1. **Given** an official channel with an open 24h window, **When** a non-empty message
   (≤4096) is sent (Enter, or button), **Then** an optimistic PENDING bubble appears, the
   composer clears, a POST persists it, and on settle the thread and conversation list refetch.
2. **Given** an official channel with a closed window, **When** the thread renders, **Then**
   the composer is locked with a notice ("A janela de atendimento está fechada…"); no send is possible.
3. **Given** an official channel with an open window, **When** the thread renders, **Then** a
   discreet hint shows the remaining time ("Janela fecha em Xh Ymin") that counts down live.
4. **Given** an unofficial (Evolution) channel, **When** the thread renders, **Then** the
   composer is never gated — sending is unconstrained.
5. **Given** the server rejects a send with 403 (window closed), **When** the error resolves,
   **Then** an error toast surfaces the window-closed message and the settle-refetch re-locks
   the composer.

### Edge Cases

- **Window recomputed locally**: the composer's open/closed is derived from `expiresAt` vs
  the local clock (ticking each minute / at expiry), **not** from the server's `isOpen`
  boolean, which the hook ignores.
- **Official channel with `expiresAt: null`/undefined window** → composer locked by default.
- **Optimistic message id** is `optimistic-<timestamp>`; it is never upgraded to "SENT" in
  cache — the confirmed message arrives via the settle-refetch, so the `"SENT"` status is
  never actually produced by the mutation.
- **Send error rolls back** the optimistic bubble.
- **Enter sends; Shift+Enter** inserts a newline; the textarea auto-grows to a max height.
- **Invalid date labels** render as empty strings.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The active channel MUST default to the first channel (no effect needed);
  the channel selector MUST render only when >1 channel exists and show an Oficial/Não
  oficial badge per channel.
- **FR-002**: Changing the channel MUST reload conversations for it and clear the open thread.
- **FR-003**: Conversations MUST list patient name/phone, last-message time, a preview
  (with fallbacks: "Sem conversa ainda", "Mídia", "Sem mensagens"), and a "Você:" prefix for
  outbound; they MUST poll every ~10s and support a debounced (350ms) name/phone search.
- **FR-004**: The thread MUST render inbound/outbound bubbles with day separators, auto-scroll
  to the latest on load/new messages, poll every ~5s, and show an outbound sending/sent icon.
- **FR-005**: The composer MUST validate `{ channelId (uuid), content (1–4096) }` with the
  shared schema before sending; Enter sends, Shift+Enter newlines, textarea auto-grows.
- **FR-006**: Sending MUST be optimistic (PENDING bubble appended, total incremented), roll
  back on error, and on settle invalidate the thread and all conversations.
- **FR-007**: For an **official** channel, the composer MUST be locked whenever the 24h
  window is not open (including a null/undefined window), and MUST show a live countdown hint
  when open; the window state MUST be recomputed locally from `expiresAt`.
- **FR-008**: For an **unofficial** channel, the composer MUST never be window-gated.
- **FR-009**: The Route Handlers MUST scope to the active clinic and: GET channels returns
  `{ data }`; GET conversations validates its query (`400`); GET messages validates its query
  (`400`) and returns the full page (incl. `windowStatus`); POST message validates the body
  (`422`), maps a backend `403` to a window-closed message with status `403`, and returns the
  created message as `{ data }` (`201`); `NO_CLINIC` → `404`.

### Key Entities

- **ChatChannel**: `{ id, name, provider (META_OFFICIAL | EVOLUTION_UNOFFICIAL), status, ... }`.
- **Conversation**: patient + last-message summary (no backend entity).
- **ChatMessage**: `{ id, direction, bodyText, occurredAt, messageType, status? }`.
- **WindowStatus**: `{ expiresAt, isOpen }` — server snapshot of the 24h window.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An operator can read and reply to a patient conversation on a connected channel.
- **SC-002**: On the official channel, no free-form message can be sent once the 24h window
  has closed (client lock + server 403).
- **SC-003**: Sent messages appear immediately (optimistic) and reconcile with the server.
- **SC-004**: The unofficial channel allows sending regardless of any window.

## Explicitly Out of Scope

- **Realtime transport** — messages/conversations use polling (5s/10s) as an explicit
  fallback "until SSE/WS lands".
- **Sending media / templates from chat** — text-only composer.
- **Read receipts / delivery beyond PENDING→(refetch)** — no read state; `"SENT"` status is
  never produced by the client.
- **Starting a new conversation** — the inbox reflects existing message groupings; there is
  no "compose to a new patient" entry point here.
- **Persisted channel selection** — the active channel resets to the first on reload.

## Open Questions

1. The service-window hook ignores the server's `isOpen` and recomputes from `expiresAt`.
   Is local recomputation intended to be authoritative on the client (with the 403 as the
   real backstop), or should the server `isOpen` be respected?
2. The optimistic message is never upgraded to `"SENT"` in cache (relies on refetch). Is the
   `"SENT"` client status dead code, or a planned enhancement?
3. Realtime (SSE/WS) is referenced as future work — is it committed, and does polling cadence
   need to be documented as interim?
