"use client";

import { MessageSquare } from "lucide-react";
import { useTranslations } from "next-intl";

/** Placeholder shown in the right pane when no conversation is selected. */
export function EmptyState({
  title,
  description,
}: {
  title?: string;
  description?: string;
}) {
  const t = useTranslations("chat");
  const resolvedTitle = title ?? t("empty.title");
  const resolvedDescription = description ?? t("empty.description");

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
        <MessageSquare className="size-6" />
      </div>
      <div className="space-y-1">
        <p className="text-base font-medium text-foreground">{resolvedTitle}</p>
        <p className="max-w-xs text-sm text-muted-foreground">{resolvedDescription}</p>
      </div>
    </div>
  );
}
