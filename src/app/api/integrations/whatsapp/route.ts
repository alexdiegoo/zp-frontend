import { type NextRequest, NextResponse } from "next/server";

import { apiClient, ApiError } from "@/lib/api/api-client";
import { resolveClinicId } from "@/lib/api/clinic";
import { connectWhatsAppSchema } from "@/lib/validations/integrations";
import type { ChannelEvolutionConnection } from "@/types/api";

type EvolutionResponse = { connection: ChannelEvolutionConnection | null };

/** Current Evolution connection (QR code / pairing code / status) — polled by the connect dialog. */
export async function GET() {
  try {
    const clinicId = await resolveClinicId();
    const data = await apiClient.get<EvolutionResponse>(
      `/clinics/${clinicId}/messaging/whatsapp/evolution/connection`,
    );
    return NextResponse.json({ data: data.connection });
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 500;
    return NextResponse.json(
      { error: "Não foi possível obter a conexão do WhatsApp." },
      { status },
    );
  }
}

/**
 * Starts an Evolution (unofficial WhatsApp) connection for the given phone
 * number. Returns the QR code / pairing code the user scans to link the device.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = connectWhatsAppSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  try {
    const clinicId = await resolveClinicId();
    const data = await apiClient.post<EvolutionResponse>(
      `/clinics/${clinicId}/messaging/whatsapp/evolution/connection`,
      parsed.data,
    );
    return NextResponse.json({ data: data.connection }, { status: 201 });
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 500;
    return NextResponse.json(
      { error: "Não foi possível iniciar a conexão do WhatsApp." },
      { status },
    );
  }
}

/** Disconnects the Evolution WhatsApp instance from the clinic. */
export async function DELETE() {
  try {
    const clinicId = await resolveClinicId();
    await apiClient.delete(
      `/clinics/${clinicId}/messaging/whatsapp/evolution/connection`,
    );
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 500;
    return NextResponse.json(
      { error: "Não foi possível desconectar o WhatsApp." },
      { status },
    );
  }
}
