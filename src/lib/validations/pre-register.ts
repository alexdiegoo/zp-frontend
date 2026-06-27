import { z } from "zod";

/**
 * Pre-registration (waitlist) lead capture for the public landing page.
 * Client-only — there is no backend integration; this schema validates the
 * inline CTA form before showing the success feedback.
 */
export const preRegisterSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome."),
  clinicName: z.string().trim().min(2, "Informe o nome da clínica."),
  email: z
    .string()
    .min(1, "Informe seu e-mail.")
    .email("Informe um e-mail válido."),
  whatsapp: z
    .string()
    .trim()
    .regex(
      /^\+?[\d\s\-()]{10,16}$/,
      "Informe um WhatsApp válido com DDD."
    ),
});

export type PreRegisterDto = z.infer<typeof preRegisterSchema>;
