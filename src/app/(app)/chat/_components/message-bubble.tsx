"use client";

import { Check, Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types/chat";
import { formatTimeLabel } from "./chat-ui";

/** A single chat bubble; outbound right-aligned (primary), inbound left (card). */
export function MessageBubble({ message }: { message: ChatMessage }) {
  const isOutbound = message.direction === "OUTBOUND";
  const isPending = message.status === "PENDING";

  return (
    <div
      className={cn(
        "flex w-full",
        isOutbound ? "justify-end" : "justify-start",
      )}
    >
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow-sm",
          isOutbound
            ? "rounded-br-sm bg-primary text-primary-foreground"
            : "rounded-bl-sm bg-card text-card-foreground border border-border",
          isPending && "opacity-70",
        )}
      >
        <p className="whitespace-pre-wrap break-words">{message.bodyText}</p>
        <div
          className={cn(
            "mt-1 flex items-center justify-end gap-1 text-[11px]",
            isOutbound ? "text-primary-foreground/80" : "text-muted-foreground",
          )}
        >
          <span>{formatTimeLabel(message.occurredAt)}</span>
          {isOutbound &&
            (isPending ? (
              <Clock className="size-3" aria-label="Enviando" />
            ) : (
              <Check className="size-3" aria-label="Enviada" />
            ))}
        </div>
      </div>
    </div>
  );
}
