import type { IntegrationProvider } from "@/types/api";

/**
 * How an integration is connected:
 * - `oauth`     → full-page redirect to the provider's consent screen.
 * - `evolution` → in-app dialog that pairs a device via QR / pairing code.
 */
export type ConnectKind = "oauth" | "evolution";

export type IntegrationConfig = {
  provider: IntegrationProvider;
  name: string;
  description: string;
  /** Path under `/public`. */
  icon: string;
  connect: ConnectKind;
};

export const INTEGRATIONS: IntegrationConfig[] = [
  {
    provider: "meta",
    name: "WhatsApp Oficial (Meta)",
    description:
      "Integre a API Oficial do WhatsApp para realizar disparos de mensagens aprovadas pelo Meta.",
    icon: "/integrations/meta.png",
    connect: "oauth",
  },
  {
    provider: "google",
    name: "Google",
    description: "Integre ao Google para sincronizar sua agenda com o google calendar.",
    icon: "/integrations/google.png",
    connect: "oauth",
  },
  {
    provider: "whatsapp",
    name: "WhatsApp",
    description:
      "Integre diretamente com o WhatsApp via API não oficial e dispare e gerencie mensagens.",
    icon: "/integrations/whatsapp.png",
    connect: "evolution",
  },
];
