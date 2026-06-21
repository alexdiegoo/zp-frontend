import { Suspense } from "react";

import { CampaignNewView } from "./view";

export const metadata = { title: "Nova campanha" };

export default function CampaignNewPage() {
  return (
    <Suspense>
      <CampaignNewView />
    </Suspense>
  );
}
