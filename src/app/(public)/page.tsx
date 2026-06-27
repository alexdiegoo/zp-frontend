import type { Metadata } from "next";

import { LandingView } from "./view";

export const metadata: Metadata = {
  title: "ZapBlast — CRM e WhatsApp marketing para clínicas",
  description:
    "Pare de perder pacientes. O ZapBlast une CRM, funil Kanban, agendamentos e disparos de WhatsApp em escala para clínicas de estética, saúde e odontologia. Entre na lista de espera.",
};

export default function LandingPage() {
  return <LandingView />;
}
