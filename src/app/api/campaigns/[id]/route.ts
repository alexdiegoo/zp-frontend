import { type NextRequest, NextResponse } from "next/server";

import { apiClient, ApiError } from "@/lib/api/api-client";
import { resolveClinicId } from "@/lib/api/clinic";
import type {
  CampaignApiType,
  CampaignDetail,
  TemplateDetail,
} from "@/types/api";

/** Backend shape of the official campaign detail endpoint. */
type OfficialDetailBackend = {
  campaign: {
    apiType: CampaignApiType;
    id: string;
    name: string;
    status: string;
    createdAt: string;
    messageTemplateId: string | null;
  };
};

/** Backend shape of the manual (unofficial) campaign detail endpoint. */
type ManualDetailBackend = {
  campaign: {
    id: string;
    name: string;
    status: string;
    createdAt: string;
    baseMessage: string | null;
    trackingMessage: string | null;
    trackingCode: string | null;
  };
};

/**
 * Campaign detail for the active clinic. The campaign's `apiType` (passed by the
 * listing row via `?type=`) decides which backend endpoint to read:
 *
 * - `UNOFFICIAL` → `GET /messaging/manual-campaigns/:id` — returns the tracked
 *   message the operator copies and sends manually.
 * - `OFFICIAL` → `GET /messaging/campaigns/:id` — returns the campaign plus its
 *   `messageTemplateId`, which we resolve into the full template detail so the UI
 *   can render the template.
 *
 * Both branches are normalized into the discriminated {@link CampaignDetail}.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const type = req.nextUrl.searchParams.get("type");

  if (type !== "OFFICIAL" && type !== "UNOFFICIAL") {
    return NextResponse.json(
      { error: "Tipo de campanha inválido." },
      { status: 400 },
    );
  }

  try {
    const clinicId = await resolveClinicId();

    if (type === "UNOFFICIAL") {
      const { campaign } = await apiClient.get<ManualDetailBackend>(
        `/clinics/${clinicId}/messaging/manual-campaigns/${id}`,
      );
      const detail: CampaignDetail = {
        apiType: "UNOFFICIAL",
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        createdAt: campaign.createdAt,
        message: campaign.trackingMessage ?? campaign.baseMessage ?? "",
        baseMessage: campaign.baseMessage,
        trackingCode: campaign.trackingCode,
      };
      return NextResponse.json({ data: detail });
    }

    const { campaign } = await apiClient.get<OfficialDetailBackend>(
      `/clinics/${clinicId}/messaging/campaigns/${id}`,
    );

    // Resolve the approved template so the detail page can render it. A missing
    // or unreadable template degrades to `null` rather than failing the page.
    let template: TemplateDetail | null = null;
    if (campaign.messageTemplateId) {
      try {
        const res = await apiClient.get<{ template: TemplateDetail }>(
          `/clinics/${clinicId}/messaging/templates/${campaign.messageTemplateId}`,
        );
        template = res.template;
      } catch {
        template = null;
      }
    }

    const detail: CampaignDetail = {
      apiType: "OFFICIAL",
      id: campaign.id,
      name: campaign.name,
      status: campaign.status,
      createdAt: campaign.createdAt,
      messageTemplateId: campaign.messageTemplateId,
      template,
    };
    return NextResponse.json({ data: detail });
  } catch (error) {
    if (error instanceof Error && error.message === "NO_CLINIC") {
      return NextResponse.json(
        { error: "Nenhuma clínica encontrada para a sua conta." },
        { status: 404 },
      );
    }
    const status = error instanceof ApiError ? error.status : 500;
    return NextResponse.json(
      {
        error:
          status === 404
            ? "Campanha não encontrada."
            : "Não foi possível carregar a campanha.",
      },
      { status },
    );
  }
}
