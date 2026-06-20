import { type NextRequest, NextResponse } from "next/server";

import { apiClient, ApiError } from "@/lib/api/api-client";
import { resolveClinicId } from "@/lib/api/clinic";

const NO_CLINIC = "Nenhuma clínica encontrada para a sua conta.";

/**
 * Cancels an appointment (backend sets status → `CANCELLED`). Forwards to
 * `DELETE /clinics/:clinicId/scheduling/appointments/:id`, which answers `204`.
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const clinicId = await resolveClinicId();
    await apiClient.delete(
      `/clinics/${clinicId}/scheduling/appointments/${id}`,
    );
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof Error && error.message === "NO_CLINIC") {
      return NextResponse.json({ error: NO_CLINIC }, { status: 404 });
    }
    const status = error instanceof ApiError ? error.status : 500;
    const message =
      error instanceof ApiError
        ? error.message
        : "Não foi possível cancelar o agendamento.";
    return NextResponse.json({ error: message }, { status });
  }
}
