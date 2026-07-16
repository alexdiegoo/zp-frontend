import { Suspense } from "react";
import { getTranslations } from "next-intl/server";

import { CampaignNewView } from "./view";

export async function generateMetadata() {
  const t = await getTranslations("campaigns");
  return { title: t("newCampaign") };
}

export default function CampaignNewPage() {
  return (
    <Suspense>
      <CampaignNewView />
    </Suspense>
  );
}
