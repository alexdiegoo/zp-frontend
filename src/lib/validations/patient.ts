import { z } from "zod";

/**
 * New-patient form schema. Shared between the "Cadastrar paciente" dialog and
 * `POST /api/patients`, which forwards to the backend
 * `POST /clinics/:clinicId/customers` (the backend names patients *customers*).
 *
 * Field rules mirror the backend contract (see `ZAPBLAST_BACKEND_API.md`):
 * `name` 2–255, `whatsappNumber` 10–20, the rest optional. Optional fields
 * accept the empty string (the form's "untouched" value); `cleanPatientPayload`
 * strips those out before the request so blanks aren't forwarded.
 */
export const createPatientSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Informe o nome do paciente.")
    .max(255, "O nome deve ter no máximo 255 caracteres."),
  whatsappNumber: z
    .string()
    .trim()
    .regex(
      /^\+?[\d\s\-()]{10,20}$/,
      "Informe um número de WhatsApp válido com DDD.",
    ),
  email: z
    .union([z.literal(""), z.string().email("Informe um e-mail válido.")])
    .optional(),
  birthDate: z.string().optional(),
  address: z
    .string()
    .trim()
    .max(500, "O endereço deve ter no máximo 500 caracteres.")
    .optional(),
  acquisitionSource: z
    .string()
    .trim()
    .max(255, "A origem deve ter no máximo 255 caracteres.")
    .optional(),
});

export type CreatePatientDto = z.infer<typeof createPatientSchema>;

/** Drops empty/whitespace-only optional fields so blanks aren't sent. */
export function cleanPatientPayload(values: CreatePatientDto) {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(values)) {
    if (typeof value === "string" && value.trim() !== "") {
      result[key] = value.trim();
    }
  }
  // `name`/`whatsappNumber` are required and validated non-empty upstream, so
  // they're always present here.
  return result as CreatePatientDto;
}

/** Validates the patient list query (`page`, `limit`, `q`) in the Route Handler. */
export const patientsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().trim().max(120).optional(),
});

export type PatientsQuery = z.infer<typeof patientsQuerySchema>;
