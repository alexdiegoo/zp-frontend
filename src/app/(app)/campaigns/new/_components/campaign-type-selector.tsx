"use client";

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
    icon: BadgeCheck,
    title: "API Oficial",
    description:
      "Disparos via WhatsApp Business API oficial. Requer template aprovado pela Meta.",
    badge: {
      label: "Disparo automático",
      className: "border-transparent bg-primary/10 text-primary",
    },
  },
  {
    type: "UNOFFICIAL",
    icon: Zap,
    title: "API Não Oficial",
    description:
      "Envio manual pelos operadores. A mensagem gerada permite identificar de qual campanha veio cada conversa.",
    badge: {
      label: "Envio Manual",
      className:
        "border-transparent bg-amber-400/15 text-amber-700 dark:text-amber-400",
    },
  },
] as const satisfies readonly {
  type: CampaignApiType;
  icon: typeof BadgeCheck;
  title: string;
  description: string;
  badge: { label: string; className: string };
}[];

/** Step 1: highlighted cards to pick the campaign's sending channel. */
export function CampaignTypeSelector({ value, onChange }: CampaignTypeSelectorProps) {
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
              <Badge variant="outline" className={option.badge.className}>
                {option.badge.label}
              </Badge>
            </div>
            <div className="space-y-1">
              <h3 className="font-medium text-foreground">{option.title}</h3>
              <p className="text-sm text-muted-foreground">{option.description}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
