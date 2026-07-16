"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Clock, Lock, SendHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { sendMessageSchema } from "@/lib/validations/chat";

const MAX_TEXTAREA_HEIGHT = 160;

/**
 * Outbound message composer: auto-expanding textarea, Enter-to-send
 * (Shift+Enter for a newline), disabled while a send is in flight. Validates the
 * content with the shared schema before firing.
 *
 * When `lockedReason` is set (e.g. a closed Meta 24h window), the input and send
 * button are disabled and a banner explains why. When `hint` is set (and not
 * locked), a discreet line below the input shows the window countdown.
 */
export function MessageComposer({
  channelId,
  isSending,
  onSend,
  lockedReason = null,
  hint = null,
}: {
  channelId: string;
  isSending: boolean;
  onSend: (content: string) => void;
  lockedReason?: string | null;
  hint?: string | null;
}) {
  const t = useTranslations("chat");
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isLocked = Boolean(lockedReason);
  const isDisabled = isSending || isLocked;

  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
  }, [value]);

  function submit() {
    const parsed = sendMessageSchema.safeParse({ channelId, content: value });
    if (!parsed.success || isDisabled) return;

    onSend(parsed.data.content);
    setValue("");
  }

  return (
    <div className="border-t border-border bg-card">
      {isLocked && (
        <div className="flex items-center gap-2 border-b border-border bg-muted px-3 py-2 text-xs text-muted-foreground">
          <Lock className="size-3.5 shrink-0" aria-hidden />
          <span>{lockedReason}</span>
        </div>
      )}

      <div className="flex items-end gap-2 p-3">
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
          placeholder={isLocked ? t("composer.unavailable") : t("composer.placeholder")}
          disabled={isDisabled}
          className="max-h-40 min-h-10 resize-none"
          aria-label={t("composer.ariaLabel")}
        />
        <Button
          type="button"
          size="icon"
          onClick={submit}
          disabled={isDisabled || value.trim().length === 0}
          aria-label={t("composer.send")}
        >
          <SendHorizontal className="size-4" />
        </Button>
      </div>

      {!isLocked && hint && (
        <p className="flex items-center gap-1.5 px-3 pb-2 text-xs text-muted-foreground">
          <Clock className="size-3 shrink-0" aria-hidden />
          {hint}
        </p>
      )}
    </div>
  );
}
