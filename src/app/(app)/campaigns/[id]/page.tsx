import { Suspense } from "react";

import type { CampaignApiType } from "@/types/api";
import { CampaignDetailView } from "./view";

export const metadata = { title: "Campanha" };

export default async function CampaignDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const [{ id }, { type }] = await Promise.all([params, searchParams]);
  // The listing row passes `?type=`; default to OFFICIAL on direct/unknown access.
  const apiType: CampaignApiType = type === "UNOFFICIAL" ? "UNOFFICIAL" : "OFFICIAL";

  return (
    <Suspense>
      <CampaignDetailView campaignId={id} apiType={apiType} />
    </Suspense>
  );
}
