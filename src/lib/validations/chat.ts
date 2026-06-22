import { z } from "zod";

/**
 * Chat validation schemas, shared between the client (composer form / query
 * params) and the BFF Route Handlers (`app/api/chat/**`), which forward to the
 * backend `/clinics/:clinicId/messaging/chat/*` endpoints.
 */

/** Query for the conversations list. */
export const conversationsQuerySchema = z.object({
  channelId: z.string().uuid("Selecione um canal válido."),
  search: z.string().trim().min(1).max(120).optional(),
});

/** Query for a conversation's message thread. */
export const messagesQuerySchema = z.object({
  channelId: z.string().uuid("Selecione um canal válido."),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(30),
});

/** Body for sending an outbound text message. */
export const sendMessageSchema = z.object({
  channelId: z.string().uuid("Selecione um canal válido."),
  content: z
    .string()
    .trim()
    .min(1, "Digite uma mensagem.")
    .max(4096, "A mensagem deve ter no máximo 4096 caracteres."),
});

export type ConversationsQuery = z.infer<typeof conversationsQuerySchema>;
export type MessagesQuery = z.infer<typeof messagesQuerySchema>;
export type SendMessageDto = z.infer<typeof sendMessageSchema>;
