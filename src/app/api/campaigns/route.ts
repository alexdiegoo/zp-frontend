import { type NextRequest, NextResponse } from "next/server";

import { apiClient, ApiError } from "@/lib/api/api-client";
import { resolveClinicId } from "@/lib/api/clinic";
import { campaignsQuerySchema } from "@/lib/validations/campaign";
import type { CampaignsListResponse } from "@/types/api";

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
