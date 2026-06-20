"use client";

import { useState } from "react";
import { AlertCircle, Plug } from "lucide-react";
import { toast } from "sonner";

import {
  useIntegrations,
  useDisconnectIntegration,
} from "@/hooks/queries/use-integrations";
import type { IntegrationProvider } from "@/types/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { H3, Muted } from "@/components/ui/typography";
import { INTEGRATIONS } from "./integrations.config";
import { IntegrationCard } from "./integration-card";
import { ConnectWhatsAppDialog } from "./connect-whatsapp-dialog";

export function IntegrationsSection() {
  const { data, isLoading, isError, error } = useIntegrations();
  const disconnect = useDisconnectIntegration();
  const [whatsappOpen, setWhatsappOpen] = useState(false);

  function handleConnect(provider: IntegrationProvider) {
    const config = INTEGRATIONS.find((i) => i.provider === provider);
    if (!config) return;

    if (config.connect === "evolution") {
      setWhatsappOpen(true);
      return;
    }
    // OAuth providers: full-page redirect to the provider's consent screen.
    window.location.assign(`/api/integrations/${provider}`);
  }

  function handleDisconnect(provider: IntegrationProvider) {
    disconnect.mutate(provider, {
      onSuccess: () => toast.success("Integração desconectada."),
      onError: (err) => toast.error(err.message),
    });
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Plug className="size-5 text-muted-foreground" />
        <div className="space-y-0.5">
          <H3>Integrações</H3>
          <Muted>
            Conecte a ZapBlast às plataformas que sua clínica já utiliza.
          </Muted>
        </div>
      </div>

      {isError ? (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>Não foi possível carregar as integrações</AlertTitle>
          <AlertDescription>
            {error instanceof Error
              ? error.message
              : "Tente novamente em instantes."}
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading || (!data && !isError)
          ? INTEGRATIONS.map((config) => (
              <IntegrationCardSkeleton key={config.provider} />
            ))
          : !data
            ? null
            : INTEGRATIONS.map((config) => {
              const status = data[config.provider];
              const isBusy =
                disconnect.isPending &&
                disconnect.variables === config.provider;
              return (
                <IntegrationCard
                  key={config.provider}
                  config={config}
                  status={status}
                  isBusy={isBusy}
                  onConnect={() => handleConnect(config.provider)}
                  onDisconnect={() => handleDisconnect(config.provider)}
                />
              );
            })}
      </div>

      <ConnectWhatsAppDialog
        open={whatsappOpen}
        onOpenChange={setWhatsappOpen}
      />
    </section>
  );
}

function IntegrationCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Skeleton className="size-11 rounded-xl" />
          <Skeleton className="h-4 w-32" />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="mt-4 h-8 w-full" />
      </CardContent>
    </Card>
  );
}
