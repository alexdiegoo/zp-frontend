import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { getData, sendData } from "@/lib/api/http";
import type { ConnectWhatsAppDto } from "@/lib/validations/integrations";
import type {
  ChannelEvolutionConnection,
  IntegrationDetails,
  IntegrationProvider,
  IntegrationsStatus,
} from "@/types/api";

export const integrationKeys = {
  all: ["integrations"] as const,
  status: () => [...integrationKeys.all, "status"] as const,
  evolution: () => [...integrationKeys.all, "evolution"] as const,
  details: (provider: IntegrationProvider) =>
    [...integrationKeys.all, "details", provider] as const,
};

/** Aggregate status of every integration for the current clinic. */
export function useIntegrations() {
  return useQuery({
    queryKey: integrationKeys.status(),
    queryFn: () => getData<IntegrationsStatus>("/api/integrations"),
    staleTime: 1000 * 30,
  });
}

/**
 * Rich, provider-specific detail for a connected integration. Fetched lazily —
 * only while the details dialog is open — since the Meta branch triggers live
 * Meta API calls on the backend.
 */
export function useIntegrationDetails(
  provider: IntegrationProvider,
  enabled: boolean,
) {
  return useQuery({
    queryKey: integrationKeys.details(provider),
    queryFn: () =>
      getData<IntegrationDetails>(
        `/api/integrations/details?provider=${provider}`,
      ),
    enabled,
    staleTime: 1000 * 30,
  });
}

/**
 * Live Evolution connection (QR / pairing / status). Enabled only while the
 * connect dialog is open, and polled so the QR refreshes and the linked state
 * is detected.
 */
export function useEvolutionConnection(enabled: boolean) {
  return useQuery({
    queryKey: integrationKeys.evolution(),
    queryFn: () =>
      getData<ChannelEvolutionConnection | null>("/api/integrations/whatsapp"),
    enabled,
    refetchInterval: enabled ? 4000 : false,
    staleTime: 0,
  });
}

/** Starts the Evolution (unofficial WhatsApp) pairing for a phone number. */
export function useConnectWhatsApp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: ConnectWhatsAppDto) =>
      sendData<ChannelEvolutionConnection>(
        "/api/integrations/whatsapp",
        "POST",
        values,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: integrationKeys.evolution() });
      qc.invalidateQueries({ queryKey: integrationKeys.status() });
    },
  });
}

/** Disconnects an integration. OAuth providers (google/meta) and Evolution all use DELETE. */
export function useDisconnectIntegration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (provider: IntegrationProvider) =>
      sendData(`/api/integrations/${provider}`, "DELETE"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: integrationKeys.status() });
    },
  });
}
