import { type NextRequest, NextResponse } from "next/server";

import { apiClient, ApiError } from "@/lib/api/api-client";
import { resolveClinicId } from "@/lib/api/clinic";
import { updateAppointmentStatusSchema } from "@/lib/validations/appointment";

const NO_CLINIC = "Nenhuma clínica encontrada para a sua conta.";

/**
 * Updates an appointment's status (e.g. "Confirmar realização" → `DONE`).
 * Forwards to `PATCH /clinics/:clinicId/scheduling/appointments/:id/status`.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = updateAppointmentStatusSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  try {
    const clinicId = await resolveClinicId();
    const data = await apiClient.patch(
      `/clinics/${clinicId}/scheduling/appointments/${id}/status`,
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
        : "Não foi possível atualizar o agendamento.";
    return NextResponse.json({ error: message }, { status });
  }
}
