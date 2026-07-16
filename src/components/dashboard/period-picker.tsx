"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DEFAULT_PERIOD_PRESET,
  presetToPeriod,
  type Period,
  type PeriodPreset,
} from "./dashboard-config";

/** `yyyy-mm-dd` (for `<input type="date">`) from a local Date. */
function toInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Local start-of-day from a `yyyy-mm-dd` input value. */
function fromInputStart(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

/** Local end-of-day from a `yyyy-mm-dd` input value (inclusive upper bound). */
function fromInputEnd(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day, 23, 59, 59, 999);
}

type PeriodPickerProps = {
  value: Period;
  onChange: (period: Period) => void;
};

/**
 * Period selector: quick-range presets plus a custom range. Presets resolve
 * relative to today; "Personalizado" reveals two date inputs validated so the
 * end is never before the start. `onChange` fires only with a valid range.
 */
export function PeriodPicker({ value, onChange }: PeriodPickerProps) {
  const t = useTranslations("dashboard");
  const presetLabels = useMemo<{ preset: PeriodPreset; label: string }[]>(
    () => [
      { preset: "7d", label: t("period.last7Days") },
      { preset: "30d", label: t("period.last30Days") },
      { preset: "90d", label: t("period.last90Days") },
      { preset: "custom", label: t("period.custom") },
    ],
    [t],
  );
  const [preset, setPreset] = useState<PeriodPreset>(DEFAULT_PERIOD_PRESET);
  const [startInput, setStartInput] = useState(() => toInputValue(value.start));
  const [endInput, setEndInput] = useState(() => toInputValue(value.end));

  const rangeInvalid =
    preset === "custom" &&
    Boolean(startInput) &&
    Boolean(endInput) &&
    fromInputEnd(endInput) < fromInputStart(startInput);

  function handlePreset(next: PeriodPreset) {
    setPreset(next);
    if (next !== "custom") {
      onChange(presetToPeriod(next));
    }
  }

  function handleCustom(nextStart: string, nextEnd: string) {
    setStartInput(nextStart);
    setEndInput(nextEnd);
    if (!nextStart || !nextEnd) return;

    const start = fromInputStart(nextStart);
    const end = fromInputEnd(nextEnd);
    if (end < start) return;

    onChange({ start, end });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {presetLabels.map(({ preset: option, label }) => (
          <Button
            key={option}
            type="button"
            size="sm"
            variant={preset === option ? "default" : "outline"}
            onClick={() => handlePreset(option)}
          >
            {label}
          </Button>
        ))}
      </div>

      {preset === "custom" ? (
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="period-start">{t("period.startLabel")}</Label>
            <Input
              id="period-start"
              type="date"
              value={startInput}
              max={endInput || undefined}
              onChange={(event) => handleCustom(event.target.value, endInput)}
              className="w-auto"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="period-end">{t("period.endLabel")}</Label>
            <Input
              id="period-end"
              type="date"
              value={endInput}
              min={startInput || undefined}
              onChange={(event) => handleCustom(startInput, event.target.value)}
              className="w-auto"
            />
          </div>
          {rangeInvalid ? (
            <p className="text-xs text-destructive">{t("period.rangeInvalid")}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
