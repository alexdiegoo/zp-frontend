import { Suspense } from "react";

import { SettingsView } from "./view";

export const metadata = { title: "Configurações" };

export default function SettingsPage() {
  return (
    <Suspense>
      <SettingsView />
    </Suspense>
  );
}
