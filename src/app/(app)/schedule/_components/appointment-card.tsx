"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  SLOT_HEIGHT,
  SLOT_MINUTES,
  formatTime,
  type PositionedAppointment,
} from "@/lib/calendar";
import type { AppointmentType } from "@/types/api";
import type { CardDragProps } from "./use-appointment-drag";

/**
 * Per-type visual identity for calendar cards. Colors come from theme tokens
 * (`--appt-*` in globals.css) so they adapt to dark mode and stay off the
 * green brand palette.
 */
export const APPOINTMENT_TYPE_META: Record<
  AppointmentType,
  { label: string; code: string; accent: string; tint: string; text: string; badge: string }
> = {
  CONSULTATION: {
    label: "Consulta",
    code: "C",
    accent: "border-l-appt-consultation",
    tint: "bg-appt-consultation/10 hover:bg-appt-consultation/15",
    text: "text-appt-consultation",
    badge: "bg-appt-consultation/15 text-appt-consultation",
  },
  PROCEDURE: {
    label: "Procedimento",
    code: "P",
    accent: "border-l-appt-procedure",
    tint: "bg-appt-procedure/10 hover:bg-appt-procedure/15",
    text: "text-appt-procedure",
    badge: "bg-appt-procedure/15 text-appt-procedure",
  },
  RETURN: {
    label: "Retorno",
    code: "R",
    accent: "border-l-appt-return",
    tint: "bg-appt-return/10 hover:bg-appt-return/15",
    text: "text-appt-return",
    badge: "bg-appt-return/15 text-appt-return",
  },
};

interface AppointmentCardProps {
  positioned: PositionedAppointment;
  onClick: (appointmentId: string) => void;
  /** Pointer handlers that make the card draggable-to-reschedule. */
  dragProps?: CardDragProps;
  /** Returns true if the click that just fired was the tail of a drag (ignore it). */
  shouldIgnoreClick?: () => boolean;
  /** Dim the card in place while it is the one being dragged. */
  isDragging?: boolean;
}

/** A single appointment block, absolutely positioned within its day column. */
export function AppointmentCard({
  positioned,
  onClick,
  dragProps,
  shouldIgnoreClick,
  isDragging,
}: AppointmentCardProps) {
  const { appt, top, height, lane, lanes } = positioned;
  const meta = APPOINTMENT_TYPE_META[appt.type];
  const compact = height < 44;
  // Completed appointments read as "done": muted surface, green success accent,
  // a check badge in place of the type code, and a struck-through name.
  const isDone = appt.status === "DONE";

  return (
    <button
      type="button"
      {...dragProps}
      onClick={(e) => {
        e.stopPropagation();
        if (shouldIgnoreClick?.()) return;
        onClick(appt.id);
      }}
      title={`${meta.label}: ${appt.patient.name} · ${formatTime(
        new Date(appt.startAt),
      )}${isDone ? " · Realizado" : ""}`}
      style={{
        top,
        height,
        left: `calc(${(lane / lanes) * 100}% + 2px)`,
        width: `calc(${100 / lanes}% - 4px)`,
      }}
      className={cn(
        "absolute z-10 touch-none overflow-hidden rounded-md border-l-4 p-1.5 text-left shadow-sm transition-colors",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        "cursor-grab active:cursor-grabbing",
        isDone
          ? "border-l-primary bg-muted hover:bg-muted/80"
          : cn(meta.accent, meta.tint),
        // Dim in place while dragging — keep pointer-events so capture holds.
        isDragging && "opacity-40",
      )}
    >
      <div className="flex items-center gap-1">
        <span
          aria-label={isDone ? "Realizado" : meta.label}
          title={isDone ? "Realizado" : meta.label}
          className={cn(
            "flex size-4 shrink-0 items-center justify-center rounded-sm text-[10px] font-bold",
            isDone ? "bg-primary text-primary-foreground" : meta.badge,
          )}
        >
          {isDone ? <Check className="size-3" /> : meta.code}
        </span>
        <p
          className={cn(
            "truncate text-xs font-semibold",
            isDone ? "text-muted-foreground line-through" : meta.text,
          )}
        >
          {appt.patient.name}
        </p>
      </div>
      {!compact ? (
        <>
          <p className="truncate text-[11px] text-muted-foreground">
            {isDone ? "Realizado" : meta.label}
          </p>
          <p className="text-[11px] text-muted-foreground/80">
            {formatTime(new Date(appt.startAt))}
          </p>
        </>
      ) : null}
    </button>
  );
}

interface DropPreviewProps {
  /** Slot index (0 = 00:00) the dragged card would land on in this column. */
  slotIndex: number;
  /** Card height in slot units. */
  durationSlots: number;
  type: AppointmentType;
}

/** Dashed snap placeholder rendered in the target column while dragging. */
export function DropPreview({ slotIndex, durationSlots, type }: DropPreviewProps) {
  const meta = APPOINTMENT_TYPE_META[type];
  const minutes = slotIndex * SLOT_MINUTES;
  const label = `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(
    minutes % 60,
  ).padStart(2, "0")}`;

  return (
    <div
      aria-hidden
      style={{
        top: slotIndex * SLOT_HEIGHT,
        height: durationSlots * SLOT_HEIGHT,
        left: 2,
        right: 2,
      }}
      className={cn(
        "pointer-events-none absolute z-30 flex items-start overflow-hidden rounded-md border-2 border-dashed p-1.5",
        meta.accent.replace("border-l-", "border-"),
        meta.tint,
      )}
    >
      <span className={cn("text-[11px] font-semibold", meta.text)}>{label}</span>
    </div>
  );
}
