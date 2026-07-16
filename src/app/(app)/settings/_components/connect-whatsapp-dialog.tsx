"use client";

import { useEffect, useMemo } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Smartphone } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import {
  useConnectWhatsApp,
  useEvolutionConnection,
  integrationKeys,
} from "@/hooks/queries/use-integrations";
import {
  connectWhatsAppSchema,
  type ConnectWhatsAppDto,
} from "@/lib/validations/integrations";
import type { ChannelEvolutionConnection } from "@/types/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Muted, P } from "@/components/ui/typography";

/** Evolution reports `open` once the device is successfully paired. */
function isLinked(status?: string | null) {
  if (!status) return false;
  return ["open", "connected", "online"].includes(status.toLowerCase());
}

/** Normalizes the QR payload (raw base64 or full data URI) into an <img> src. */
function qrSrc(qrCode: string) {
  return qrCode.startsWith("data:")
    ? qrCode
    : `data:image/png;base64,${qrCode}`;
}

interface ConnectWhatsAppDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConnectWhatsAppDialog({
  open,
  onOpenChange,
}: ConnectWhatsAppDialogProps) {
  const t = useTranslations("settings");
  const qc = useQueryClient();

  const form = useForm<ConnectWhatsAppDto>({
    resolver: zodResolver(connectWhatsAppSchema),
    mode: "onBlur",
    defaultValues: { phoneNumber: "" },
  });

  const connect = useConnectWhatsApp();
  // Start polling only after a pairing has been initiated.
  const polling = open && connect.isSuccess;
  const evolution = useEvolutionConnection(polling);

  // The polling endpoint (`evolution.data`) only carries the live status — it
  // never returns the QR / pairing payload, which comes solely from the initial
  // pairing (`connect.data`). Merging keeps the QR visible while we poll for the
  // linked status, instead of the poll blanking it out and looping forever.
  const connection = useMemo<ChannelEvolutionConnection | null>(() => {
    const base = connect.data ?? null;
    const live = evolution.data ?? null;
    if (!base && !live) return null;
    return {
      ...base,
      ...live,
      qrCode: live?.qrCode ?? base?.qrCode ?? null,
      pairingCode: live?.pairingCode ?? base?.pairingCode ?? null,
    } as ChannelEvolutionConnection;
  }, [connect.data, evolution.data]);
  const linked = isLinked(connection?.status);

  // Close the dialog once the device is linked.
  useEffect(() => {
    if (open && linked) {
      toast.success(t("whatsapp.connectSuccess"));
      qc.invalidateQueries({ queryKey: integrationKeys.status() });
      onOpenChange(false);
    }
  }, [open, linked, onOpenChange, qc, t]);

  function handleOpenChange(next: boolean) {
    if (!next) {
      // Reset everything so reopening starts a fresh pairing.
      form.reset();
      connect.reset();
      qc.removeQueries({ queryKey: integrationKeys.evolution() });
    }
    onOpenChange(next);
  }

  function onSubmit(values: ConnectWhatsAppDto) {
    connect.mutate(values, {
      onError: (error) => toast.error(error.message),
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("whatsapp.dialogTitle")}</DialogTitle>
          <DialogDescription>{t("whatsapp.dialogDescription")}</DialogDescription>
        </DialogHeader>

        {connect.isSuccess ? (
          <PairingStep connection={connection} />
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              noValidate
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("whatsapp.phoneLabel")}</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        autoComplete="tel"
                        placeholder="+55 11 99999-9999"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={!form.formState.isValid || connect.isPending}
              >
                {connect.isPending ? (
                  <>
                    <Loader2 className="animate-spin" />
                    {t("whatsapp.generating")}
                  </>
                ) : (
                  t("whatsapp.generate")
                )}
              </Button>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function PairingStep({
  connection,
}: {
  connection: ChannelEvolutionConnection | null;
}) {
  const t = useTranslations("settings");
  const qrCode = connection?.qrCode;
  const pairingCode = connection?.pairingCode;

  return (
    <div className="flex flex-col items-center gap-4 py-2">
      <div className="flex size-56 items-center justify-center overflow-hidden rounded-xl border border-border bg-background">
        {qrCode ? (
          <Image
            src={qrSrc(qrCode)}
            alt={t("whatsapp.qrAlt")}
            width={224}
            height={224}
            unoptimized
            className="size-full object-contain"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Loader2 className="size-6 animate-spin" />
            <Muted>{t("whatsapp.generating")}</Muted>
          </div>
        )}
      </div>

      {pairingCode ? (
        <div className="text-center">
          <Muted>{t("whatsapp.pairingCodeLabel")}</Muted>
          <P className="font-mono text-base font-semibold tracking-widest">
            {pairingCode}
          </P>
        </div>
      ) : null}

      <div className="flex items-center gap-2 text-muted-foreground">
        <Smartphone className="size-4" />
        <Muted>{t("whatsapp.instructions")}</Muted>
      </div>
    </div>
  );
}
