import { NextResponse } from "next/server";

import { apiClient, ApiError } from "@/lib/api/api-client";
import { resolveClinicId } from "@/lib/api/clinic";
import type { ChatChannel } from "@/types/chat";

/**
 * Lists the active clinic's WhatsApp channels usable in the chat surface.
 * Forwards to the backend `GET /clinics/:clinicId/messaging/chat/channels`.
 */
export async function GET() {
  try {
    const clinicId = await resolveClinicId();
    const data = await apiClient.get<{ data: ChatChannel[] }>(
      `/clinics/${clinicId}/messaging/chat/channels`,
    );
    return NextResponse.json({ data: data.data });
  } catch (error) {
    if (error instanceof Error && error.message === "NO_CLINIC") {
      return NextResponse.json(
        { error: "Nenhuma clínica encontrada para a sua conta." },
        { status: 404 },
      );
    }
    const status = error instanceof ApiError ? error.status : 500;
    return NextResponse.json(
      { error: "Não foi possível carregar os canais." },
      { status },
    );
  }
}
