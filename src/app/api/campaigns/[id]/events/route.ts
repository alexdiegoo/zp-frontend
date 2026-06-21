import { type NextRequest, NextResponse } from "next/server";

import { apiClient, ApiError } from "@/lib/api/api-client";
import { resolveClinicId } from "@/lib/api/clinic";
import { campaignEventsQuerySchema } from "@/lib/validations/campaign";
import type { CampaignEventsResponse } from "@/types/api";

/**
 * Per-contact event timeline for a single campaign (drill-down). Backed by the
 * backend `GET /clinics/:clinicId/messaging/campaigns/:id/events`, which is a
 * stub for now (empty page) until event sourcing lands — the route exists so the
 * client contract is ready ahead of the feature.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const parsed = campaignEventsQuerySchema.safeParse(
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
    const data = await apiClient.get<CampaignEventsResponse>(
      `/clinics/${clinicId}/messaging/campaigns/${id}/events`,
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
      { error: "Não foi possível carregar os eventos da campanha." },
      { status },
    );
  }
}
