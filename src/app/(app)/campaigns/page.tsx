import { Suspense } from "react";

import { CampaignsView } from "./view";

export const metadata = { title: "Campanhas" };

export default function CampaignsPage() {
  return (
    <Suspense>
      <CampaignsView />
    </Suspense>
  );
}
