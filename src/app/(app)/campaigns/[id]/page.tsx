import { Suspense } from "react";
import { getTranslations } from "next-intl/server";

import type { CampaignApiType } from "@/types/api";
import { CampaignDetailView } from "./view";

export async function generateMetadata() {
  const t = await getTranslations("nav");
  return { title: t("campaigns") };
}

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
