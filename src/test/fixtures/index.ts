import type { Appointment } from "@/types/api";
import type { WindowStatus } from "@/types/chat";

/**
 * Typed factory builders for domain objects used across tests. Each returns a
 * complete, valid object; pass `overrides` to vary only the fields a test cares
 * about. Built against `types/api.ts` / `types/chat.ts` so they stay in lockstep
 * with the real shapes (no `any`).
 */

let seq = 0;
/** Deterministic id generator (no Math.random, so tests stay reproducible). */
function nextId(prefix: string): string {
  seq += 1;
  return `${prefix}_${seq}`;
}

export function makeAppointment(
  overrides: Partial<Appointment> = {},
): Appointment {
  const id = overrides.id ?? nextId("appt");
  return {
    id,
    clinicId: 1,
    type: "CONSULTATION",
    status: "SCHEDULED",
    startAt: "2025-06-20T09:00:00.000Z",
    endAt: "2025-06-20T09:30:00.000Z",
    patient: { id: "pat_1", name: "Ana Souza", whatsappNumber: "5511999998888" },
    patientId: "pat_1",
    procedure: { id: "proc_1", name: "Consulta" },
    procedureId: "proc_1",
    professional: { id: "prof_1", name: "Dra. Lima" },
    professionalId: "prof_1",
    parentAppointmentId: null,
    procedureRecord: null,
    notes: null,
    createdAt: "2025-06-01T12:00:00.000Z",
    updatedAt: "2025-06-01T12:00:00.000Z",
    ...overrides,
  };
}

export function makeWindowStatus(
  overrides: Partial<WindowStatus> = {},
): WindowStatus {
  return {
    expiresAt: "2025-06-20T18:00:00.000Z",
    isOpen: true,
    ...overrides,
  };
}
