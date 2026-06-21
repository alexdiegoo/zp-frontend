import { NextResponse } from "next/server";

import { apiClient, ApiError } from "@/lib/api/api-client";
import { resolveClinicId } from "@/lib/api/clinic";
import type { WaPhoneNumber } from "@/types/api";

/**
 * Lists the active clinic's official (Meta) WhatsApp sender numbers for the
 * campaign builder. Forwards to the backend
 * `GET /clinics/:clinicId/messaging/whatsapp/phone-numbers` and returns its
 * `{ data }` array unwrapped under our own `{ data }` envelope.
 */
export async function GET() {
  try {
    const clinicId = await resolveClinicId();
    const result = await apiClient.get<{ data: WaPhoneNumber[] }>(
      `/clinics/${clinicId}/messaging/whatsapp/phone-numbers`,
    );
    return NextResponse.json({ data: result.data });
  } catch (error) {
    if (error instanceof Error && error.message === "NO_CLINIC") {
      return NextResponse.json(
        { error: "Nenhuma clínica encontrada para a sua conta." },
        { status: 404 },
      );
    }
    const status = error instanceof ApiError ? error.status : 500;
    return NextResponse.json(
      { error: "Não foi possível carregar os números de WhatsApp." },
      { status },
    );
  }
}
