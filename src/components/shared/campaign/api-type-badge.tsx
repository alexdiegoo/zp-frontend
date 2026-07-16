"use client";

import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import type { CampaignApiType } from "@/types/api";

/**
 * Channel badge for a campaign. Orange = official Meta API, amber = unofficial
 * (manual) channel. Shared between the campaigns listing and the detail page.
 */
export function ApiTypeBadge({ apiType }: { apiType: CampaignApiType }) {
  const t = useTranslations("campaigns");

  if (apiType === "OFFICIAL") {
    return (
      <Badge
        variant="outline"
        className="border-transparent bg-orange-500/12 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400"
      >
        {t("channel.officialBadge")}
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="border-transparent bg-amber-400/15 text-amber-700 dark:bg-amber-400/15 dark:text-amber-400"
    >
      {t("channel.unofficialBadge")}
    </Badge>
  );
}
