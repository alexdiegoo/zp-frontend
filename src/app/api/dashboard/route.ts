import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { apiClient, ApiError } from "@/lib/api/api-client";
import { resolveClinicId } from "@/lib/api/clinic";
import type { DashboardMetricsResponse } from "@/types/api";

const NO_CLINIC = "Nenhuma clínica encontrada para a sua conta.";
const LOAD_ERROR = "Não foi possível carregar as métricas do dashboard.";

/** Period query the dashboard requires; dates are ISO 8601 strings. */
const periodSchema = z.object({
  start_date: z.string().min(1),
  end_date: z.string().min(1),
});

/**
 * Dashboard metrics for the active clinic. Validates the period query, then
 * forwards to the backend `GET /clinics/:clinicId/dashboard` (clinic resolved
 * from the tenant cookie) and returns its payload under the `{ data }` envelope.
 */
export async function GET(request: NextRequest) {
  const parsed = periodSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: "Informe start_date e end_date." }, { status: 400 });
  }

  try {
    const clinicId = await resolveClinicId();
    const data = await apiClient.get<DashboardMetricsResponse>(`/clinics/${clinicId}/dashboard`, {
      params: parsed.data,
    });
    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof Error && error.message === "NO_CLINIC") {
      return NextResponse.json({ error: NO_CLINIC }, { status: 404 });
    }
    const status = error instanceof ApiError ? error.status : 500;
    return NextResponse.json({ error: LOAD_ERROR }, { status });
  }
}
