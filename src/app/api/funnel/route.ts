import { NextResponse } from "next/server";

import { apiClient, ApiError } from "@/lib/api/api-client";
import { resolveClinicId } from "@/lib/api/clinic";
import type { FunnelBoard } from "@/types/api";

const NO_CLINIC = "Nenhuma clínica encontrada para a sua conta.";

/**
 * Funnel board for the active clinic. Forwards to the backend
 * `GET /clinics/:clinicId/funnel` and returns its stage-grouped payload under
 * the `{ data }` envelope.
 */
export async function GET() {
  try {
    const clinicId = await resolveClinicId();
    const data = await apiClient.get<FunnelBoard>(`/clinics/${clinicId}/funnel`);
    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof Error && error.message === "NO_CLINIC") {
      return NextResponse.json({ error: NO_CLINIC }, { status: 404 });
    }
    const status = error instanceof ApiError ? error.status : 500;
    return NextResponse.json(
      { error: "Não foi possível carregar o funil." },
      { status },
    );
  }
}
