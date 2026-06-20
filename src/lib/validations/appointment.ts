import { z } from "zod";

import type { AppointmentType } from "@/types/api";

/**
 * Appointment schemas, shared between the calendar's "Novo agendamento" dialog
 * and `POST /api/appointments` (which forwards to the backend
 * `POST /clinics/:clinicId/scheduling/appointments`).
 *
 * Contract note (see `ZAPBLAST_BACKEND_API.md`): the backend marks `procedureId`
 * as **required for every type**, so the form requires it for CONSULTATION,
 * PROCEDURE and RETURN alike — picking it conditionally would 422 on a plain
 * consultation. `priceCharged` is required (in the UI) only for PROCEDURE; it is
 * not part of the documented POST body, so we forward it best-effort.
 */

export const APPOINTMENT_TYPES = [
  "CONSULTATION",
  "PROCEDURE",
  "RETURN",
] as const satisfies readonly AppointmentType[];

/** Human labels for the type select, in display order. */
export const APPOINTMENT_TYPE_OPTIONS: { value: AppointmentType; label: string }[] =
  [
    { value: "CONSULTATION", label: "Consulta" },
    { value: "PROCEDURE", label: "Procedimento" },
    { value: "RETURN", label: "Retorno" },
  ];

const priceField = z
  .union([
    z.literal(""),
    z
      .string()
      .trim()
      .regex(/^\d+([.,]\d{1,2})?$/, "Informe um valor válido (ex.: 150,00)."),
  ])
  .optional();

/**
 * Raw form schema (validated client-side by the dialog). `startAt` is an ISO
 * string set from the clicked slot; `durationMinutes` derives `endAt`. The
 * cross-field rule enforces a charged price only when the type is PROCEDURE.
 */
export const createAppointmentFormSchema = z
  .object({
    type: z.enum(APPOINTMENT_TYPES, { message: "Selecione o tipo." }),
    patientId: z.string().min(1, "Selecione o paciente."),
    procedureId: z.string().min(1, "Selecione o procedimento."),
    priceCharged: priceField,
    professionalId: z.string().optional(),
    // Kept as a string (like other numeric form fields) so the input can hold
    // intermediate values; coerced to a number at submit time.
    durationMinutes: z
      .string()
      .regex(/^\d+$/, "Informe a duração em minutos.")
      .refine((v) => {
        const n = Number(v);
        return n >= 5 && n <= 600;
      }, "A duração deve ficar entre 5 e 600 minutos."),
    notes: z
      .string()
      .trim()
      .max(2000, "As observações devem ter no máximo 2000 caracteres.")
      .optional(),
    startAt: z.string().min(1),
  })
  .superRefine((values, ctx) => {
    if (values.type === "PROCEDURE" && !values.priceCharged?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["priceCharged"],
        message: "Informe o valor cobrado.",
      });
    }
  });

export type CreateAppointmentForm = z.infer<typeof createAppointmentFormSchema>;

/** The cleaned wire payload forwarded by the BFF to the backend. */
export type CreateAppointmentPayload = {
  type: AppointmentType;
  patientId: string;
  procedureId: string;
  startAt: string;
  endAt: string;
  professionalId?: string;
  parentAppointmentId?: string;
  priceCharged?: number;
  notes?: string;
};

/**
 * Server-side schema for the cleaned request body. The Route Handler
 * re-validates with this before forwarding — `createAppointmentFormSchema`
 * validates raw form input, this validates the wire shape.
 */
export const createAppointmentSchema = z.object({
  type: z.enum(APPOINTMENT_TYPES),
  patientId: z.string().min(1),
  procedureId: z.string().min(1),
  startAt: z.string().min(1),
  endAt: z.string().min(1),
  professionalId: z.string().min(1).optional(),
  parentAppointmentId: z.string().min(1).optional(),
  priceCharged: z.number().min(0).optional(),
  notes: z.string().trim().max(2000).optional(),
});

/** Validates the calendar date-window query (`startAt`, `endAt`) in the Route Handler. */
export const appointmentsQuerySchema = z.object({
  startAt: z.string().min(1),
  endAt: z.string().min(1),
});

/* ------------------------------------------------------------------ *
 * Status update & reschedule (appointment-detail actions)
 * ------------------------------------------------------------------ */

/** Statuses the detail dialog can transition an appointment into. */
export const APPOINTMENT_STATUS_ACTIONS = [
  "IN_PROGRESS",
  "DONE",
  "CANCELLED",
  "NO_SHOW",
] as const;

/**
 * Body for `PATCH /scheduling/appointments/:id/status`. Shared by the detail
 * dialog's "Confirmar realização" action and the Route Handler.
 */
export const updateAppointmentStatusSchema = z.object({
  status: z.enum(APPOINTMENT_STATUS_ACTIONS),
  priceCharged: z.number().min(0).optional(),
  notes: z.string().trim().max(2000).optional(),
});

export type UpdateAppointmentStatusPayload = z.infer<
  typeof updateAppointmentStatusSchema
>;

/**
 * Raw reschedule form schema (validated client-side). `startAt` comes from a
 * `datetime-local` input; `durationMinutes` derives the new `endAt`.
 */
export const rescheduleFormSchema = z.object({
  startAt: z.string().min(1, "Informe a nova data e horário."),
  durationMinutes: z
    .string()
    .regex(/^\d+$/, "Informe a duração em minutos.")
    .refine((v) => {
      const n = Number(v);
      return n >= 5 && n <= 600;
    }, "A duração deve ficar entre 5 e 600 minutos."),
  professionalId: z.string().optional(),
});

export type RescheduleForm = z.infer<typeof rescheduleFormSchema>;

/** Cleaned wire payload for `PATCH /scheduling/appointments/:id/reschedule`. */
export type ReschedulePayload = {
  startAt: string;
  endAt: string;
  professionalId?: string;
};

/** Server-side schema the Route Handler re-validates the reschedule body against. */
export const rescheduleAppointmentSchema = z.object({
  startAt: z.string().min(1),
  endAt: z.string().min(1),
  professionalId: z.string().min(1).optional(),
});
