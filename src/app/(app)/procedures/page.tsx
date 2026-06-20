import { Suspense } from "react";

import { ProceduresView } from "./view";

export const metadata = { title: "Procedimentos" };

export default function ProceduresPage() {
  return (
    <Suspense>
      <ProceduresView />
    </Suspense>
  );
}
