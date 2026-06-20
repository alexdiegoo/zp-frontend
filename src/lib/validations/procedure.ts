import { z } from "zod";

/**
 * New-procedure form schema. Shared between the "Cadastrar procedimento" dialog
 * and `POST /api/procedures`, which forwards to the backend
 * `POST /clinics/:clinicId/catalog/procedures` (the backend names procedures
 * *services*).
 *
 * Field rules mirror the backend contract (see `ZAPBLAST_BACKEND_API.md`):
 * `name` required ≤ 120, `description` optional ≤ 500, `basePrice` optional ≥ 0.
 * The price field is a string in the form (so the input can be empty);
 * `cleanProcedurePayload` coerces it to a number and strips blank optionals
 * before the request.
 */
export const createProcedureSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Informe o nome do procedimento.")
    .max(120, "O nome deve ter no máximo 120 caracteres."),
  description: z
    .string()
    .trim()
    .max(500, "A descrição deve ter no máximo 500 caracteres.")
    .optional(),
  basePrice: z
    .union([
      z.literal(""),
      z
        .string()
        .trim()
        .regex(/^\d+([.,]\d{1,2})?$/, "Informe um valor válido (ex.: 150,00)."),
    ])
    .optional(),
});

export type CreateProcedureDto = z.infer<typeof createProcedureSchema>;

/** The payload actually forwarded to the backend (price coerced to a number). */
export type ProcedurePayload = {
  name: string;
  description?: string;
  basePrice?: number;
};

/**
 * Coerces the form values into the backend payload: trims the name, drops a
 * blank description, and parses `basePrice` (`"150,00"` → `150`) only when set.
 */
export function cleanProcedurePayload(
  values: CreateProcedureDto,
): ProcedurePayload {
  const payload: ProcedurePayload = { name: values.name.trim() };

  const description = values.description?.trim();
  if (description) payload.description = description;

  const price = values.basePrice?.trim();
  if (price) payload.basePrice = Number(price.replace(",", "."));

  return payload;
}

/**
 * Server-side schema for the cleaned wire payload (`basePrice` already coerced
 * to a number). The Route Handler re-validates with this before forwarding to
 * the backend — `createProcedureSchema` validates the raw *form* input, this
 * validates the *request* shape produced by {@link cleanProcedurePayload}.
 */
export const procedurePayloadSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(500).optional(),
  basePrice: z.number().min(0).optional(),
});

/** Validates the procedure list query (`page`, `limit`, `q`) in the Route Handler. */
export const proceduresQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().trim().max(120).optional(),
});

export type ProceduresQuery = z.infer<typeof proceduresQuerySchema>;
