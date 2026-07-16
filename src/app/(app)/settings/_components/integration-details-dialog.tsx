"use client";

import { AlertCircle, Loader2, Phone } from "lucide-react";
import { useTranslations } from "next-intl";

import { useIntegrationDetails } from "@/hooks/queries/use-integrations";
import type { IntegrationDetails, IntegrationProvider } from "@/types/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Muted, P } from "@/components/ui/typography";

interface IntegrationDetailsDialogProps {
  provider: IntegrationProvider;
  /** Localized provider name, shown in the dialog title. */
  name: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function IntegrationDetailsDialog({
  provider,
  name,
  open,
  onOpenChange,
}: IntegrationDetailsDialogProps) {
  const t = useTranslations("settings");
  // Fetch lazily: only while the dialog is open (the Meta branch hits Meta live).
  const { data, isLoading, isError, error } = useIntegrationDetails(
    provider,
    open,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("integrationDetails.title")}</DialogTitle>
          <DialogDescription>{name}</DialogDescription>
        </DialogHeader>

        {isLoading || (!data && !isError) ? (
          <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
            <Muted>{t("integrationDetails.loading")}</Muted>
          </div>
        ) : isError ? (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertTitle>{t("integrationDetails.error")}</AlertTitle>
            <AlertDescription>
              {error instanceof Error
                ? error.message
                : t("integrationDetails.error")}
            </AlertDescription>
          </Alert>
        ) : (
          <DetailsBody details={data} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function DetailsBody({ details }: { details: IntegrationDetails }) {
  const t = useTranslations("settings");

  if (details.provider === "meta") {
    return (
      <div className="space-y-4">
        <DetailRow
          label={t("integrationDetails.meta.businessName")}
          value={
            details.businessName ??
            t("integrationDetails.meta.businessNameFallback")
          }
        />
        <div className="space-y-2">
          <Muted>{t("integrationDetails.meta.phoneNumbers")}</Muted>
          {details.phoneNumbers.length > 0 ? (
            <ul className="space-y-2">
              {details.phoneNumbers.map((phone) => (
                <li
                  key={phone.id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2"
                >
                  <Phone className="size-4 shrink-0 text-muted-foreground" />
                  <div className="flex flex-col">
                    <P className="text-sm font-medium">{phone.number}</P>
                    {phone.name ? <Muted>{phone.name}</Muted> : null}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <Muted>{t("integrationDetails.meta.noNumbers")}</Muted>
          )}
        </div>
      </div>
    );
  }

  if (details.provider === "google") {
    return (
      <div className="space-y-4">
        <DetailRow
          label={t("integrationDetails.google.email")}
          value={details.email}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <DetailRow
        label={t("integrationDetails.whatsapp.phoneNumber")}
        value={details.phoneNumber ?? "—"}
      />
      {details.profileName ? (
        <DetailRow
          label={t("integrationDetails.whatsapp.profileName")}
          value={details.profileName}
        />
      ) : null}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <Muted>{label}</Muted>
      <P className="text-sm font-medium">{value}</P>
    </div>
  );
}
