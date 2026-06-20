"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Section, PageHeader } from "@/components/shared/layout/page-header";
import { integrationKeys } from "@/hooks/queries/use-integrations";
import { IntegrationsSection } from "./_components/integrations-section";

const PROVIDER_LABELS: Record<string, string> = {
  google: "Google",
  meta: "WhatsApp Oficial (Meta)",
  whatsapp: "WhatsApp",
};

/** `?<provider>_connected=true` flags the backend OAuth callback bounces back. */
const CONNECTED_PARAMS: Record<string, string> = {
  google_connected: "google",
  meta_connected: "meta",
};

export function SettingsView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const integrationError = searchParams.get("integration_error");
  const connectedParam = Object.keys(CONNECTED_PARAMS).find(
    (key) => searchParams.get(key) === "true",
  );

  // Surface OAuth failures bounced back from the connect Route Handlers.
  useEffect(() => {
    if (!integrationError) return;
    const label = PROVIDER_LABELS[integrationError] ?? "a integração";
    toast.error(`Não foi possível conectar ${label}. Tente novamente.`);
    router.replace("/settings");
  }, [integrationError, router]);

  // Surface OAuth successes the provider callback redirects back with, and
  // refresh the status so the card flips to "connected".
  useEffect(() => {
    if (!connectedParam) return;
    const provider = CONNECTED_PARAMS[connectedParam];
    const label = PROVIDER_LABELS[provider] ?? "a integração";
    toast.success(`${label} conectado com sucesso.`);
    queryClient.invalidateQueries({ queryKey: integrationKeys.status() });
    router.replace("/settings");
  }, [connectedParam, queryClient, router]);

  return (
    <Section>
      <PageHeader
        title="Configurações"
        description="Preferências da conta e da clínica."
      />
      <IntegrationsSection />
    </Section>
  );
}
