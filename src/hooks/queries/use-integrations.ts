import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import type { ConnectWhatsAppDto } from "@/lib/validations/integrations";
import type {
  ChannelEvolutionConnection,
  IntegrationProvider,
  IntegrationsStatus,
} from "@/types/api";

export const integrationKeys = {
  all: ["integrations"] as const,
  status: () => [...integrationKeys.all, "status"] as const,
  evolution: () => [...integrationKeys.all, "evolution"] as const,
};

/** Reads `{ data }` from a BFF Route Handler, surfacing its error message. */
async function getData<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      json && typeof json.error === "string"
        ? json.error
        : "Algo deu errado. Tente novamente.";
    throw new Error(message);
  }
  return json.data as T;
}

async function sendJson<T>(
  url: string,
  method: "POST" | "DELETE",
  body?: unknown,
): Promise<T | null> {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return null;
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      json && typeof json.error === "string"
        ? json.error
        : "Algo deu errado. Tente novamente.";
    throw new Error(message);
  }
  return (json?.data ?? null) as T | null;
}

/** Aggregate status of every integration for the current clinic. */
export function useIntegrations() {
  return useQuery({
    queryKey: integrationKeys.status(),
    queryFn: () => getData<IntegrationsStatus>("/api/integrations"),
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
      sendJson<ChannelEvolutionConnection>(
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
      sendJson(`/api/integrations/${provider}`, "DELETE"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: integrationKeys.status() });
    },
  });
}
