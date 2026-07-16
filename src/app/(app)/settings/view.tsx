"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Section, PageHeader } from "@/components/shared/layout/page-header";
import { integrationKeys } from "@/hooks/queries/use-integrations";
import { IntegrationsSection } from "./_components/integrations-section";

/** `?<provider>_connected=true` flags the backend OAuth callback bounces back. */
const CONNECTED_PARAMS: Record<string, string> = {
  google_connected: "google",
  meta_connected: "meta",
};

export function SettingsView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const t = useTranslations("settings");
  const integrationError = searchParams.get("integration_error");
  const connectedParam = Object.keys(CONNECTED_PARAMS).find(
    (key) => searchParams.get(key) === "true",
  );

  // Surface OAuth failures bounced back from the connect Route Handlers.
  useEffect(() => {
    if (!integrationError) return;
    const labels: Record<string, string> = {
      google: t("providers.google"),
      meta: t("providers.meta"),
      whatsapp: t("providers.whatsapp"),
    };
    const label = labels[integrationError] ?? t("integration.fallbackLabel");
    toast.error(t("integration.connectError", { provider: label }));
    router.replace("/settings");
  }, [integrationError, router, t]);

  // Surface OAuth successes the provider callback redirects back with, and
  // refresh the status so the card flips to "connected".
  useEffect(() => {
    if (!connectedParam) return;
    const provider = CONNECTED_PARAMS[connectedParam];
    const labels: Record<string, string> = {
      google: t("providers.google"),
      meta: t("providers.meta"),
      whatsapp: t("providers.whatsapp"),
    };
    const label = labels[provider] ?? t("integration.fallbackLabel");
    toast.success(t("integration.connectSuccess", { provider: label }));
    queryClient.invalidateQueries({ queryKey: integrationKeys.status() });
    router.replace("/settings");
  }, [connectedParam, queryClient, router, t]);

  return (
    <Section>
      <PageHeader title={t("title")} description={t("description")} />
      <IntegrationsSection />
    </Section>
  );
}
