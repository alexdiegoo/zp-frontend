import { Suspense } from "react";

import { TemplatesView } from "./view";

export const metadata = { title: "Templates" };

export default function TemplatesPage() {
  return (
    <Suspense>
      <TemplatesView />
    </Suspense>
  );
}
