import { Suspense } from "react";
import { getTranslations } from "next-intl/server";

import { CampaignsView } from "./view";

export async function generateMetadata() {
  const t = await getTranslations("nav");
  return { title: t("campaigns") };
}

export default function CampaignsPage() {
  return (
    <Suspense>
      <CampaignsView />
    </Suspense>
  );
}
