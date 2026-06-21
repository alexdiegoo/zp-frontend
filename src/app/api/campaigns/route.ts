import { type NextRequest, NextResponse } from "next/server";

import { apiClient, ApiError } from "@/lib/api/api-client";
import { resolveClinicId } from "@/lib/api/clinic";
import {
  campaignsQuerySchema,
  createCampaignSchema,
} from "@/lib/validations/campaign";
import type { CampaignsListResponse, CreatedCampaign } from "@/types/api";

/**
 * Campaigns overview for the active clinic. Forwards search/status/apiType/period
 * filters and pagination to the backend
 * `GET /clinics/:clinicId/messaging/campaigns/overview` and returns its
 * `{ data, meta }` envelope unchanged.
 */
export async function GET(req: NextRequest) {
  const parsed = campaignsQuerySchema.safeParse(
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
    const data = await apiClient.get<CampaignsListResponse>(
      `/clinics/${clinicId}/messaging/campaigns/overview`,
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
      { error: "Não foi possível carregar as campanhas." },
      { status },
    );
  }
}

/**
 * Creates a campaign (official or unofficial) via the builder. Re-validates the
 * discriminated body and forwards it to the backend
 * `POST /clinics/:clinicId/messaging/campaigns/builder`, returning the created
 * campaign (UNOFFICIAL includes the tracked message to copy).
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = createCampaignSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  try {
    const clinicId = await resolveClinicId();
    const data = await apiClient.post<CreatedCampaign>(
      `/clinics/${clinicId}/messaging/campaigns/builder`,
      parsed.data,
    );
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "NO_CLINIC") {
      return NextResponse.json(
        { error: "Nenhuma clínica encontrada para a sua conta." },
        { status: 404 },
      );
    }
    const status = error instanceof ApiError ? error.status : 500;
    const message =
      error instanceof ApiError && error.message
        ? error.message
        : "Não foi possível criar a campanha.";
    return NextResponse.json({ error: message }, { status });
  }
}
