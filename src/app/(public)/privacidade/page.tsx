import type { Metadata } from "next";

import { PrivacyPolicyView } from "./view";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description:
    "Política de Privacidade do ZapBlast — como coletamos, usamos, compartilhamos e protegemos os dados pessoais, e como você pode solicitar a exclusão dos seus dados.",
};

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyView />;
}
