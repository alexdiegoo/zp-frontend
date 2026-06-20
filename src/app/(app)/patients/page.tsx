import { Suspense } from "react";

import { PatientsView } from "./view";

export const metadata = { title: "Pacientes" };

export default function PatientsPage() {
  return (
    <Suspense>
      <PatientsView />
    </Suspense>
  );
}
