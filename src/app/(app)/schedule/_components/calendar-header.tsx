"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  formatDayLabel,
  formatWeekRange,
  getWeekDays,
  type ViewMode,
} from "@/lib/calendar";

interface CalendarHeaderProps {
  currentDate: Date;
  viewMode: ViewMode;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onViewModeChange: (mode: ViewMode) => void;
}

/** Date-range label + prev/next/today navigation + week|day mode toggle. */
export function CalendarHeader({
  currentDate,
  viewMode,
  onPrev,
  onNext,
  onToday,
  onViewModeChange,
}: CalendarHeaderProps) {
  const rangeLabel =
    viewMode === "week"
      ? formatWeekRange(getWeekDays(currentDate))
      : formatDayLabel(currentDate);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={onToday}>
          Hoje
        </Button>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label={viewMode === "week" ? "Semana anterior" : "Dia anterior"}
            onClick={onPrev}
          >
            <ChevronLeft className="size-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={viewMode === "week" ? "Próxima semana" : "Próximo dia"}
            onClick={onNext}
          >
            <ChevronRight className="size-5" />
          </Button>
        </div>
        <h2 className="text-base font-semibold text-foreground">{rangeLabel}</h2>
      </div>

      <div
        role="tablist"
        aria-label="Modo de visualização"
        className="flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-1"
      >
        {(["week", "day"] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            role="tab"
            aria-selected={viewMode === mode}
            onClick={() => onViewModeChange(mode)}
            className={cn(
              "rounded-md px-3 py-1 text-sm font-medium transition-colors",
              viewMode === mode
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {mode === "week" ? "Semana" : "Dia"}
          </button>
        ))}
      </div>
    </div>
  );
}
