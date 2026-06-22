"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { CheckCircle2 } from "lucide-react";

import { ContactAvatar } from "@/components/shared/contact-avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { FunnelCard as FunnelCardType } from "@/types/api";

interface FunnelCardProps {
  card: FunnelCardType;
}

/** A draggable patient card. The PROCEDURE_DONE stage gets a "completed" accent. */
export function FunnelCard({ card }: FunnelCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: card.id });

  const isDone = card.stage === "PROCEDURE_DONE";

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "rounded-lg border bg-card p-3 shadow-sm",
        isDragging ? "cursor-grabbing opacity-40" : "cursor-grab",
        isDone && "border-l-4 border-l-green-500",
      )}
    >
      {isDone ? (
        <div className="mb-2 flex items-center justify-between">
          <Badge
            variant="outline"
            className="border-green-500 text-green-600"
          >
            Concluído
          </Badge>
          <CheckCircle2 className="size-4 text-green-500" aria-hidden />
        </div>
      ) : null}
      <div className={cn("flex items-center gap-3", isDone && "opacity-75")}>
        <ContactAvatar name={card.full_name} className="size-9" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{card.full_name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {card.phone_number}
          </p>
        </div>
      </div>
    </div>
  );
}
