"use client";

import { useEffect, useRef } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { formatPhone } from "@/lib/format";
import type { ChatMessage, Conversation } from "@/types/chat";
import { ContactAvatar, formatDayLabel } from "./chat-ui";
import { MessageBubble } from "./message-bubble";
import { MessageComposer } from "./message-composer";

/** Right pane: conversation header, message list (auto-scroll) and composer. */
export function MessageThread({
  conversation,
  channelId,
  messages,
  isLoading,
  isError,
  isSending,
  onSend,
}: {
  conversation: Conversation;
  channelId: string;
  messages: ChatMessage[];
  isLoading: boolean;
  isError: boolean;
  isSending: boolean;
  onSend: (content: string) => void;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the newest message on open, on new messages and on send.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [conversation.patientId, messages.length]);

  return (
    <section className="flex h-full min-w-0 flex-1 flex-col bg-background">
      <header className="flex items-center gap-3 border-b border-border bg-card px-4 py-3">
        <ContactAvatar name={conversation.patientName || conversation.phoneNumber} className="size-9" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">
            {conversation.patientName || formatPhone(conversation.phoneNumber)}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {formatPhone(conversation.phoneNumber)}
          </p>
        </div>
      </header>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-4">
        {isLoading ? (
          <ThreadSkeleton />
        ) : isError ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Não foi possível carregar as mensagens.
          </p>
        ) : messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nenhuma mensagem nesta conversa ainda.
          </p>
        ) : (
          <MessageList messages={messages} />
        )}
        <div ref={bottomRef} />
      </div>

      <MessageComposer channelId={channelId} isSending={isSending} onSend={onSend} />
    </section>
  );
}

/** Renders messages with day separators between calendar days. */
function MessageList({ messages }: { messages: ChatMessage[] }) {
  const items = messages.map((message, index) => {
    const day = formatDayLabel(message.occurredAt);
    const previousDay = index > 0 ? formatDayLabel(messages[index - 1].occurredAt) : null;
    return { day, message, showSeparator: day !== previousDay };
  });

  return (
    <>
      {items.map(({ day, message, showSeparator }) => (
        <div key={message.id} className="space-y-2">
          {showSeparator && (
            <div className="flex justify-center py-2">
              <span className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">
                {day}
              </span>
            </div>
          )}
          <MessageBubble message={message} />
        </div>
      ))}
    </>
  );
}

function ThreadSkeleton() {
  return (
    <div className="space-y-3">
      {[
        "ml-0 w-2/5",
        "ml-auto w-1/2",
        "ml-0 w-1/3",
        "ml-auto w-2/5",
        "ml-0 w-1/2",
      ].map((shape, index) => (
        <Skeleton key={index} className={`h-10 rounded-2xl ${shape}`} />
      ))}
    </div>
  );
}
