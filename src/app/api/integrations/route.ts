import { NextResponse } from "next/server";

import { apiClient, ApiError } from "@/lib/api/api-client";
import { resolveClinicId } from "@/lib/api/clinic";
import type {
  ChannelConnection,
  ChannelEvolutionConnection,
  GoogleCalendarConnection,
  IntegrationsStatus,
} from "@/types/api";

type GoogleResponse = { connection: GoogleCalendarConnection | null };
type WhatsAppConnectionsResponse = {
  connection: ChannelConnection | null;
  evolutionConnection: ChannelEvolutionConnection | null;
};

/**
 * Aggregated status of every platform integration for the current clinic.
 * The client consumes a normalized `{ connected, detail }` per provider — the
 * raw provider payloads never reach the browser.
 */
export async function GET() {
  try {
    const clinicId = await resolveClinicId();
    const base = `/clinics/${clinicId}`;

    // Degrade gracefully: a single provider endpoint failing shouldn't blank
    // the whole section — that provider is just reported as disconnected.
    const [googleResult, whatsappResult] = await Promise.allSettled([
      apiClient.get<GoogleResponse>(
        `${base}/scheduling/google-calendar/connection`,
      ),
      apiClient.get<WhatsAppConnectionsResponse>(
        `${base}/messaging/whatsapp/connections`,
      ),
    ]);

    const google =
      googleResult.status === "fulfilled"
        ? googleResult.value
        : { connection: null };
    const whatsapp =
      whatsappResult.status === "fulfilled"
        ? whatsappResult.value
        : { connection: null, evolutionConnection: null };

    const meta = whatsapp.connection;
    const evolution = whatsapp.evolutionConnection;

    const status: IntegrationsStatus = {
      google: {
        connected: Boolean(google.connection),
        detail: google.connection?.email ?? null,
      },
      meta: {
        connected: Boolean(meta),
        detail: meta?.phoneNumber ?? meta?.displayName ?? meta?.wabaName ?? null,
      },
      whatsapp: {
        connected: Boolean(evolution),
        detail: evolution?.profileName ?? evolution?.phoneNumber ?? null,
      },
    };

    return NextResponse.json({ data: status });
  } catch (error) {
    if (error instanceof Error && error.message === "NO_CLINIC") {
      return NextResponse.json(
        { error: "Nenhuma clínica encontrada para a sua conta." },
        { status: 404 },
      );
    }
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: "Não foi possível carregar as integrações." },
        { status: error.status },
      );
    }
    return NextResponse.json(
      { error: "Erro inesperado ao carregar as integrações." },
      { status: 500 },
    );
  }
}
