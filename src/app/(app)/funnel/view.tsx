"use client";

import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";

import { PageHeader, Section } from "@/components/shared/layout/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useFunnelBoard, useMoveFunnelCard } from "@/hooks/queries/use-funnel";
import { FUNNEL_STAGES } from "@/lib/validations/funnel";
import type { FunnelBoard, FunnelStage } from "@/types/api";

import { FunnelColumn } from "./_components/funnel-column";
import { FUNNEL_STAGE_ORDER } from "./_components/funnel-constants";

function isFunnelStage(value: string): value is FunnelStage {
  return (FUNNEL_STAGES as readonly string[]).includes(value);
}

/** Finds the stage a card currently sits in, to skip same-column drops. */
function stageOf(board: FunnelBoard, cardId: string): FunnelStage | null {
  for (const stage of FUNNEL_STAGES) {
    if (board[stage].some((card) => card.id === cardId)) return stage;
  }
  return null;
}

export function FunnelView() {
  const t = useTranslations("funnel");
  const { data: board, isLoading, isError } = useFunnelBoard();
  const { mutate: moveCard } = useMoveFunnelCard();

  // A small activation distance lets clicks through while still enabling drag.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || !board) return;

    const targetStage = String(over.id);
    if (!isFunnelStage(targetStage)) return;

    const entryId = String(active.id);
    if (stageOf(board, entryId) === targetStage) return;

    moveCard({ entryId, stage: targetStage });
  }

  return (
    <Section>
      <PageHeader title={t("title")} description={t("description")} />

      {isError ? (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>{t("error.title")}</AlertTitle>
          <AlertDescription>{t("error.description")}</AlertDescription>
        </Alert>
      ) : isLoading || !board ? (
        <div className="flex flex-row gap-4 overflow-x-auto pb-4">
          {FUNNEL_STAGE_ORDER.map((stage) => (
            <Skeleton key={stage} className="h-[60vh] w-72 flex-shrink-0 rounded-xl" />
          ))}
        </div>
      ) : (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="flex min-h-[calc(100vh-160px)] flex-row gap-4 overflow-x-auto pb-4">
            {FUNNEL_STAGE_ORDER.map((stage) => (
              <FunnelColumn key={stage} stage={stage} cards={board[stage]} />
            ))}
          </div>
        </DndContext>
      )}
    </Section>
  );
}
