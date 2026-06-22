import { type NextRequest, NextResponse } from "next/server";

import { apiClient, ApiError } from "@/lib/api/api-client";
import { resolveClinicId } from "@/lib/api/clinic";
import { conversationsQuerySchema } from "@/lib/validations/chat";
import type { Conversation } from "@/types/chat";

/**
 * Lists conversations for a channel (one row per patient, latest first).
 * Forwards to `GET /clinics/:clinicId/messaging/chat/conversations`.
 */
export async function GET(req: NextRequest) {
  const parsed = conversationsQuerySchema.safeParse(
    Object.fromEntries(req.nextUrl.searchParams),
  );

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    const clinicId = await resolveClinicId();
    const data = await apiClient.get<{ data: Conversation[] }>(
      `/clinics/${clinicId}/messaging/chat/conversations`,
      { params: parsed.data },
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
      { error: "Não foi possível carregar as conversas." },
      { status },
    );
  }
}
