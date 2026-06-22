"use client";

import { useDroppable } from "@dnd-kit/core";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { FunnelCard as FunnelCardType, FunnelStage } from "@/types/api";

import { FunnelCard } from "./funnel-card";
import { FUNNEL_STAGE_COLORS, FUNNEL_STAGE_LABELS } from "./funnel-constants";

interface FunnelColumnProps {
  stage: FunnelStage;
  cards: FunnelCardType[];
}

/** A droppable stage column listing its cards. */
export function FunnelColumn({ stage, cards }: FunnelColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex w-72 flex-shrink-0 flex-col rounded-xl border bg-card/50",
        isOver && "ring-2 ring-ring ring-offset-2",
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between rounded-t-xl border-b border-l-4 px-3 py-2",
          FUNNEL_STAGE_COLORS[stage],
        )}
      >
        <span className="text-sm font-medium text-foreground">
          {FUNNEL_STAGE_LABELS[stage]}
        </span>
        <Badge variant="secondary">{cards.length}</Badge>
      </div>
      <div className="flex min-h-[200px] flex-col gap-2 p-3">
        {cards.map((card) => (
          <FunnelCard key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
}
