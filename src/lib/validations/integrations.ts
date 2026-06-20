import { z } from "zod";

/**
 * Connecting the unofficial WhatsApp channel (Evolution) requires the phone
 * number that will be paired. Shared between the connect dialog and the
 * `POST /api/integrations/whatsapp` Route Handler.
 */
export const connectWhatsAppSchema = z.object({
  phoneNumber: z
    .string()
    .trim()
    .regex(
      /^\+?[\d\s\-()]{10,20}$/,
      "Informe um número de WhatsApp válido com DDI e DDD.",
    ),
});

export type ConnectWhatsAppDto = z.infer<typeof connectWhatsAppSchema>;
