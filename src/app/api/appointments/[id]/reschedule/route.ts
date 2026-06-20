import { type NextRequest, NextResponse } from "next/server";

import { apiClient, ApiError } from "@/lib/api/api-client";
import { resolveClinicId } from "@/lib/api/clinic";
import { rescheduleAppointmentSchema } from "@/lib/validations/appointment";

const NO_CLINIC = "Nenhuma clínica encontrada para a sua conta.";

/**
 * Reschedules an appointment (new date/time, optionally a different
 * professional). Forwards to
 * `PATCH /clinics/:clinicId/scheduling/appointments/:id/reschedule`.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = rescheduleAppointmentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  try {
    const clinicId = await resolveClinicId();
    const data = await apiClient.patch(
      `/clinics/${clinicId}/scheduling/appointments/${id}/reschedule`,
      parsed.data,
    );
    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof Error && error.message === "NO_CLINIC") {
      return NextResponse.json({ error: NO_CLINIC }, { status: 404 });
    }
    const status = error instanceof ApiError ? error.status : 500;
    const message =
      error instanceof ApiError
        ? error.message
        : "Não foi possível reagendar o agendamento.";
    return NextResponse.json({ error: message }, { status });
  }
}
