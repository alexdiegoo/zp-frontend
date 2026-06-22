"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { SendHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { sendMessageSchema } from "@/lib/validations/chat";

const MAX_TEXTAREA_HEIGHT = 160;

/**
 * Outbound message composer: auto-expanding textarea, Enter-to-send
 * (Shift+Enter for a newline), disabled while a send is in flight. Validates the
 * content with the shared schema before firing.
 */
export function MessageComposer({
  channelId,
  isSending,
  onSend,
}: {
  channelId: string;
  isSending: boolean;
  onSend: (content: string) => void;
}) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
  }, [value]);

  function submit() {
    const parsed = sendMessageSchema.safeParse({ channelId, content: value });
    if (!parsed.success || isSending) return;

    onSend(parsed.data.content);
    setValue("");
  }

  return (
    <div className="flex items-end gap-2 border-t border-border bg-card p-3">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            submit();
          }
        }}
        rows={1}
        placeholder="Digite uma mensagem..."
        disabled={isSending}
        className="max-h-40 min-h-10 resize-none"
        aria-label="Mensagem"
      />
      <Button
        type="button"
        size="icon"
        onClick={submit}
        disabled={isSending || value.trim().length === 0}
        aria-label="Enviar mensagem"
      >
        <SendHorizontal className="size-4" />
      </Button>
    </div>
  );
}
