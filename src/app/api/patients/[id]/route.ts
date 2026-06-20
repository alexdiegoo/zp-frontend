import { type NextRequest, NextResponse } from "next/server";

import { apiClient, ApiError } from "@/lib/api/api-client";
import { resolveClinicId } from "@/lib/api/clinic";
import type { PatientDetail } from "@/types/api";

/**
 * Full patient profile (profile + service history + lifetime-value stats) from
 * the backend `GET /clinics/:clinicId/customers/:customerId`.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const clinicId = await resolveClinicId();
    const data = await apiClient.get<PatientDetail>(
      `/clinics/${clinicId}/customers/${id}`,
    );
    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof Error && error.message === "NO_CLINIC") {
      return NextResponse.json(
        { error: "Nenhuma clínica encontrada para a sua conta." },
        { status: 404 },
      );
    }
    const status = error instanceof ApiError ? error.status : 500;
    return NextResponse.json(
      {
        error:
          status === 404
            ? "Paciente não encontrado."
            : "Não foi possível carregar o paciente.",
      },
      { status },
    );
  }
}
