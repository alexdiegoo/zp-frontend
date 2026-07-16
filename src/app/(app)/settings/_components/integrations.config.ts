import type { useTranslations } from "next-intl";

import type { IntegrationProvider } from "@/types/api";

/** Translator bound to the `settings` message namespace (type-checked keys). */
type Translator = ReturnType<typeof useTranslations<"settings">>;

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

/** Builds the integration catalog with translated display labels. */
export function getIntegrations(t: Translator): IntegrationConfig[] {
  return [
    {
      provider: "meta",
      name: t("providers.meta"),
      description: t("providers.metaDescription"),
      icon: "/integrations/meta.png",
      connect: "oauth",
    },
    {
      provider: "google",
      name: t("providers.google"),
      description: t("providers.googleDescription"),
      icon: "/integrations/google.png",
      connect: "oauth",
    },
    {
      provider: "whatsapp",
      name: t("providers.whatsapp"),
      description: t("providers.whatsappDescription"),
      icon: "/integrations/whatsapp.png",
      connect: "evolution",
    },
  ];
}
