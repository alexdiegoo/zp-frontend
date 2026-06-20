import { NextResponse } from "next/server";

import { apiClient, ApiError } from "@/lib/api/api-client";
import { resolveClinicId } from "@/lib/api/clinic";
import type { Professional } from "@/types/api";

/**
 * Professionals of the active clinic, for the appointment dialog's optional
 * "Profissional" select. The backend `GET /clinics/:clinicId/professionals`
 * returns `{ data: [...] }`; we re-wrap the inner array in our own `{ data }`
 * envelope so the client `getData` helper unwraps a plain `Professional[]`.
 */
export async function GET() {
  try {
    const clinicId = await resolveClinicId();
    const res = await apiClient.get<{ data: Professional[] }>(
      `/clinics/${clinicId}/professionals`,
    );
    return NextResponse.json({ data: res.data ?? [] });
  } catch (error) {
    if (error instanceof Error && error.message === "NO_CLINIC") {
      return NextResponse.json(
        { error: "Nenhuma clínica encontrada para a sua conta." },
        { status: 404 },
      );
    }
    const status = error instanceof ApiError ? error.status : 500;
    return NextResponse.json(
      { error: "Não foi possível carregar os profissionais." },
      { status },
    );
  }
}
