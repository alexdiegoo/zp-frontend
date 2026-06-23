import { type NextRequest, NextResponse } from "next/server";

import { apiClient, ApiError } from "@/lib/api/api-client";
import { resolveClinicId } from "@/lib/api/clinic";
import { messagesQuerySchema, sendMessageSchema } from "@/lib/validations/chat";
import type { ChatMessage, MessagesPage } from "@/types/chat";

type RouteContext = { params: Promise<{ patientId: string }> };

/**
 * Paginated message thread for a patient on a channel. Forwards to
 * `GET /clinics/:clinicId/messaging/chat/conversations/:patientId/messages`.
 */
export async function GET(req: NextRequest, ctx: RouteContext) {
  const { patientId } = await ctx.params;
  const parsed = messagesQuerySchema.safeParse(
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
    const data = await apiClient.get<MessagesPage>(
      `/clinics/${clinicId}/messaging/chat/conversations/${patientId}/messages`,
      { params: parsed.data },
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
      { error: "Não foi possível carregar as mensagens." },
      { status },
    );
  }
}

/** Sends an outbound text message and returns the persisted message. */
export async function POST(req: NextRequest, ctx: RouteContext) {
  const { patientId } = await ctx.params;
  const body = await req.json().catch(() => null);
  const parsed = sendMessageSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  try {
    const clinicId = await resolveClinicId();
    const data = await apiClient.post<{ message: ChatMessage }>(
      `/clinics/${clinicId}/messaging/chat/conversations/${patientId}/messages`,
      parsed.data,
    );
    return NextResponse.json({ data: data.message }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "NO_CLINIC") {
      return NextResponse.json(
        { error: "Nenhuma clínica encontrada para a sua conta." },
        { status: 404 },
      );
    }
    // A 403 from the backend means the Meta 24h customer-service window is
    // closed — surface a specific message so the composer/toast can explain it.
    if (error instanceof ApiError && error.status === 403) {
      return NextResponse.json(
        { error: "A janela de atendimento de 24h está fechada. Aguarde o paciente responder." },
        { status: 403 },
      );
    }
    const status = error instanceof ApiError ? error.status : 500;
    return NextResponse.json(
      { error: "Não foi possível enviar a mensagem." },
      { status },
    );
  }
}
