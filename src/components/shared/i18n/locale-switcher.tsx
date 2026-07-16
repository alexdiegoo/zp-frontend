"use client";

import { Languages } from "lucide-react";
import { useLocale } from "next-intl";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LOCALE_LABELS, LOCALES, type Locale } from "@/i18n/config";
import { useSetLocale } from "@/hooks/queries/use-locale";
import { localeSchema } from "@/lib/validations/i18n";
import { cn } from "@/lib/utils";

type LocaleSwitcherProps = {
  /** Optional class applied to the trigger (e.g. full-width in the settings page). */
  className?: string;
  "aria-label"?: string;
};

/**
 * Shared language switcher (Principle VI) — the single UI for changing the
 * active language across the app shell and the settings page. Validates the
 * selection with the shared `localeSchema` before firing (Principle V), disables
 * while the change is in flight, and styles purely through theme tokens.
 */
export function LocaleSwitcher({
  className,
  "aria-label": ariaLabel,
}: LocaleSwitcherProps) {
  const activeLocale = useLocale();
  const { mutate, isPending } = useSetLocale();

  function handleChange(value: string) {
    const parsed = localeSchema.safeParse(value);
    if (!parsed.success) return; // never fire on an unsupported value
    if (parsed.data === activeLocale) return;
    mutate(parsed.data);
  }

  return (
    <Select
      value={activeLocale}
      onValueChange={handleChange}
      disabled={isPending}
    >
      <SelectTrigger
        className={cn("gap-2", className)}
        aria-label={ariaLabel ?? LOCALE_LABELS[activeLocale as Locale]}
      >
        <Languages className="size-4 text-muted-foreground" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        {LOCALES.map((locale) => (
          <SelectItem key={locale} value={locale}>
            {LOCALE_LABELS[locale]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
