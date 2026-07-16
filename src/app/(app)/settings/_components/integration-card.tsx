"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

import type { IntegrationStatus } from "@/types/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Muted } from "@/components/ui/typography";
import type { IntegrationConfig } from "./integrations.config";
import { IntegrationDetailsDialog } from "./integration-details-dialog";

interface IntegrationCardProps {
  config: IntegrationConfig;
  status: IntegrationStatus;
  onConnect: () => void;
  onDisconnect: () => void;
  isBusy: boolean;
}

export function IntegrationCard({
  config,
  status,
  onConnect,
  onDisconnect,
  isBusy,
}: IntegrationCardProps) {
  const t = useTranslations("settings");
  const { connected, detail } = status;
  const [detailsOpen, setDetailsOpen] = useState(false);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-background">
            <Image
              src={config.icon}
              alt={config.name}
              width={28}
              height={28}
              className="size-7 object-contain"
            />
          </span>
          <div className="flex flex-col items-start gap-1">
            <CardTitle>{config.name}</CardTitle>
            {connected ? (
              <Badge variant="secondary" className="gap-1">
                <Check className="size-3" />
                {t("integration.connected")}
              </Badge>
            ) : null}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <CardDescription>{config.description}</CardDescription>
        {connected && detail ? (
          <Muted className="mt-2 truncate">{detail}</Muted>
        ) : null}
      </CardContent>

      <CardFooter>
        {connected ? (
          <div className="flex w-full gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setDetailsOpen(true)}
            >
              {t("integration.details")}
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={onDisconnect}
              disabled={isBusy}
            >
              {isBusy ? <Loader2 className="animate-spin" /> : null}
              {t("integration.disconnect")}
            </Button>
          </div>
        ) : (
          <Button className="w-full" onClick={onConnect} disabled={isBusy}>
            {isBusy ? <Loader2 className="animate-spin" /> : null}
            {t("integration.connect")}
          </Button>
        )}
      </CardFooter>

      {connected ? (
        <IntegrationDetailsDialog
          provider={config.provider}
          name={config.name}
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
        />
      ) : null}
    </Card>
  );
}
