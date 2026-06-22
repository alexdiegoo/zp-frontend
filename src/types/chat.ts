/**
 * Chat API types mirroring the backend messaging/chat DTOs
 * (`/clinics/:clinicId/messaging/chat/*`). A "conversation" is the grouping of
 * channel messages by patient — there is no conversation entity on the backend.
 */

export type MessageDirection = "INBOUND" | "OUTBOUND";

export type ChannelProvider = "META_OFFICIAL" | "EVOLUTION_UNOFFICIAL";

/** A selectable WhatsApp channel for the chat surface. */
export type ChatChannel = {
  displayAddress: string | null;
  id: string;
  instanceName: string;
  name: string;
  provider: ChannelProvider;
  status: string;
};

/** One conversation row: a clinic patient and the channel's latest message (if any). */
export type Conversation = {
  lastMessageAt: string | null;
  lastMessageDirection: MessageDirection | null;
  lastMessagePreview: string | null;
  lastMessageType: string | null;
  patientId: string;
  patientName: string;
  phoneNumber: string;
};

/** A single message inside a conversation thread. */
export type ChatMessage = {
  bodyText: string | null;
  direction: MessageDirection;
  id: string;
  messageType: string;
  occurredAt: string;
  providerMessageId: string;
  /** Client-only optimistic state; absent for server-confirmed messages. */
  status?: "PENDING" | "SENT";
};

/** Paginated thread of messages for a patient on a channel. */
export type MessagesPage = {
  data: ChatMessage[];
  limit: number;
  page: number;
  total: number;
  totalPages: number;
};
