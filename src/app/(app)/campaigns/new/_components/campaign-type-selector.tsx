"use client";

import { useTranslations } from "next-intl";
import { BadgeCheck, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CampaignApiType } from "@/types/api";

interface CampaignTypeSelectorProps {
  value: CampaignApiType | null;
  onChange: (value: CampaignApiType) => void;
}

const OPTIONS = [
  {
    type: "OFFICIAL",
    i18n: "official",
    icon: BadgeCheck,
    badgeClassName: "border-transparent bg-primary/10 text-primary",
  },
  {
    type: "UNOFFICIAL",
    i18n: "unofficial",
    icon: Zap,
    badgeClassName:
      "border-transparent bg-amber-400/15 text-amber-700 dark:text-amber-400",
  },
] as const satisfies readonly {
  type: CampaignApiType;
  i18n: "official" | "unofficial";
  icon: typeof BadgeCheck;
  badgeClassName: string;
}[];

/** Step 1: highlighted cards to pick the campaign's sending channel. */
export function CampaignTypeSelector({ value, onChange }: CampaignTypeSelectorProps) {
  const t = useTranslations("campaigns");
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {OPTIONS.map((option) => {
        const selected = value === option.type;
        const Icon = option.icon;

        return (
          <button
            key={option.type}
            type="button"
            onClick={() => onChange(option.type)}
            aria-pressed={selected}
            className={cn(
              "flex flex-col gap-3 rounded-xl border bg-card p-5 text-left transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              selected
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "border-border hover:border-primary/40 hover:bg-muted/40",
            )}
          >
            <div className="flex items-center justify-between">
              <span
                className={cn(
                  "flex size-11 items-center justify-center rounded-lg transition-colors",
                  selected
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground",
                )}
              >
                <Icon className="size-6" />
              </span>
              <Badge variant="outline" className={option.badgeClassName}>
                {t(`selector.${option.i18n}.badge`)}
              </Badge>
            </div>
            <div className="space-y-1">
              <h3 className="font-medium text-foreground">
                {t(`channel.${option.i18n}`)}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t(`selector.${option.i18n}.description`)}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
