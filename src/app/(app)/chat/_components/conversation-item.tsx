"use client";

import { cn } from "@/lib/utils";
import { formatPhone } from "@/lib/format";
import type { Conversation } from "@/types/chat";
import { ContactAvatar, formatTimeLabel } from "./chat-ui";

/** A single row in the conversation list. */
export function ConversationItem({
  conversation,
  isActive,
  onSelect,
}: {
  conversation: Conversation;
  isActive: boolean;
  onSelect: () => void;
}) {
  const preview = conversation.lastMessagePreview?.trim();
  const hasMessage = conversation.lastMessageAt !== null;
  const previewText =
    preview && preview.length > 0
      ? preview
      : !hasMessage
        ? "Sem conversa ainda"
        : conversation.lastMessageType !== "conversation"
          ? "Mídia"
          : "Sem mensagens";

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={isActive}
      className={cn(
        "flex w-full items-center gap-3 px-3 py-3 text-left transition-colors",
        "border-b border-border/60 hover:bg-muted",
        isActive && "bg-muted",
      )}
    >
      <ContactAvatar name={conversation.patientName || conversation.phoneNumber} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate text-sm font-medium text-foreground">
            {conversation.patientName || formatPhone(conversation.phoneNumber)}
          </span>
          <span className="shrink-0 text-xs text-muted-foreground">
            {conversation.lastMessageAt ? formatTimeLabel(conversation.lastMessageAt) : ""}
          </span>
        </div>
        <p className="truncate text-sm text-muted-foreground">
          {conversation.lastMessageDirection === "OUTBOUND" && (
            <span className="text-muted-foreground/80">Você: </span>
          )}
          {previewText}
        </p>
      </div>
    </button>
  );
}
