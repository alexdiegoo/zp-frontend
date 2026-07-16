import { type NextRequest, NextResponse } from "next/server";

import { apiClient, ApiError } from "@/lib/api/api-client";
import { resolveClinicId } from "@/lib/api/clinic";
import type { IntegrationDetails, IntegrationProvider } from "@/types/api";

type GoogleResponse = {
  connection: {
    email: string;
    connectedAt: string | null;
    expiresAt: string | null;
  } | null;
};

type EvolutionResponse = {
  connection: {
    phoneNumber: string | null;
    profileName: string | null;
    status: string;
  } | null;
};

type ConnectionsResponse = {
  connection: {
    businessName: string | null;
    phoneNumbers: readonly {
      id: string;
      displayNumber: string;
      displayName: string | null;
    }[];
  } | null;
};

type OverviewResponse = {
  connections: readonly { facebookAccountName: string }[];
};

const PROVIDERS: readonly IntegrationProvider[] = ["google", "meta", "whatsapp"];

function isProvider(value: string | null): value is IntegrationProvider {
  return value !== null && PROVIDERS.includes(value as IntegrationProvider);
}

/**
 * Rich, provider-specific detail for a connected integration, consumed lazily by
 * the settings "Details" dialog. The raw provider payloads never reach the
 * browser — each branch is normalized to the {@link IntegrationDetails} union.
 */
export async function GET(req: NextRequest) {
  const provider = req.nextUrl.searchParams.get("provider");

  if (!isProvider(provider)) {
    return NextResponse.json(
      { error: "Integração inválida." },
      { status: 400 },
    );
  }

  try {
    const clinicId = await resolveClinicId();
    const base = `/clinics/${clinicId}`;

    if (provider === "google") {
      const res = await apiClient.get<GoogleResponse>(
        `${base}/scheduling/google-calendar/connection`,
      );
      if (!res.connection) {
        return NextResponse.json(
          { error: "Integração não conectada." },
          { status: 404 },
        );
      }
      const details: IntegrationDetails = {
        provider: "google",
        email: res.connection.email,
        connectedAt: res.connection.connectedAt,
        expiresAt: res.connection.expiresAt,
      };
      return NextResponse.json({ data: details });
    }

    if (provider === "meta") {
      const res = await apiClient.get<ConnectionsResponse>(
        `${base}/messaging/whatsapp/connections`,
      );
      const connection = res.connection;
      if (!connection) {
        return NextResponse.json(
          { error: "Integração não conectada." },
          { status: 404 },
        );
      }

      // The Business Manager name is persisted at connect time. For connections
      // linked before that was stored it may be missing — resolve it live from
      // the overview endpoint as a one-off fallback.
      let businessName = connection.businessName;
      if (!businessName) {
        const overview = await apiClient
          .get<OverviewResponse>(`${base}/messaging/whatsapp/overview`)
          .catch(() => null);
        businessName = overview?.connections[0]?.facebookAccountName ?? null;
      }

      const details: IntegrationDetails = {
        provider: "meta",
        businessName,
        phoneNumbers: connection.phoneNumbers.map((phone) => ({
          id: phone.id,
          number: phone.displayNumber,
          name: phone.displayName,
        })),
      };
      return NextResponse.json({ data: details });
    }

    const res = await apiClient.get<EvolutionResponse>(
      `${base}/messaging/whatsapp/evolution/connection`,
    );
    if (!res.connection) {
      return NextResponse.json(
        { error: "Integração não conectada." },
        { status: 404 },
      );
    }
    const details: IntegrationDetails = {
      provider: "whatsapp",
      phoneNumber: res.connection.phoneNumber,
      profileName: res.connection.profileName,
      status: res.connection.status,
    };
    return NextResponse.json({ data: details });
  } catch (error) {
    if (error instanceof Error && error.message === "NO_CLINIC") {
      return NextResponse.json(
        { error: "Nenhuma clínica encontrada para a sua conta." },
        { status: 404 },
      );
    }
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: "Não foi possível carregar os detalhes da integração." },
        { status: error.status },
      );
    }
    return NextResponse.json(
      { error: "Erro inesperado ao carregar os detalhes da integração." },
      { status: 500 },
    );
  }
}
