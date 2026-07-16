"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Check, CircleCheck, Copy, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { CreatedCampaign } from "@/types/api";

interface CampaignSuccessProps {
  campaign: CreatedCampaign;
}

/**
 * Post-creation state for unofficial campaigns: the user must copy the tracked
 * message (with the invisible tracking already embedded) and send it manually.
 */
export function CampaignSuccess({ campaign }: CampaignSuccessProps) {
  const t = useTranslations("campaigns");
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const message = campaign.trackedMessage ?? "";

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable (e.g. insecure context) — leave the textarea for manual copy.
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CircleCheck className="size-6" />
        </div>
        <CardTitle>{t("success.title")}</CardTitle>
        <CardDescription>
          {t("success.description", { name: campaign.name })}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-start gap-2 rounded-lg border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-700 dark:text-amber-400">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          <p>{t("success.warning")}</p>
        </div>

        <Textarea
          readOnly
          rows={6}
          value={message}
          aria-label={t("trackedMessageLabel")}
          className="bg-muted/40"
        />

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/campaigns")}
          >
            {t("success.goToCampaigns")}
          </Button>
          <Button type="button" onClick={copyMessage}>
            {copied ? <Check /> : <Copy />}
            {copied ? t("copied") : t("copyMessage")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
