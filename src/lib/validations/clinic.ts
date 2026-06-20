import { z } from "zod";

/**
 * Creating a clinic (tenant). Mirrors `POST /api/v1/clinics` (name + category,
 * both min. 2 chars). Shared between the create-clinic dialog and the
 * `POST /api/clinics` Route Handler so validation is never duplicated.
 */
export const createClinicSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "O nome da clínica deve ter ao menos 2 caracteres.")
    .max(120, "O nome da clínica é muito longo."),
  category: z
    .string()
    .trim()
    .min(2, "Informe a área de atuação (ao menos 2 caracteres).")
    .max(120, "A área de atuação é muito longa."),
});

export type CreateClinicDto = z.infer<typeof createClinicSchema>;
