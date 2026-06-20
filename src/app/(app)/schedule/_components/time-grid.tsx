"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import {
  DAY_HEIGHT,
  SLOT_HEIGHT,
  SLOT_MINUTES,
  SLOTS_PER_DAY,
  TIME_GUTTER_WIDTH,
  dayKey,
  formatHourLabel,
  groupByDay,
  isToday,
  isWeekend,
  layoutDayAppointments,
  minutesSinceMidnight,
  weekdayShort,
} from "@/lib/calendar";
import type { Appointment } from "@/types/api";
import { AppointmentCard, DropPreview } from "./appointment-card";
import {
  useAppointmentDrag,
  type ActiveDrag,
  type CardDragProps,
} from "./use-appointment-drag";

interface TimeGridProps {
  /** The day columns to render: 7 (week) or 1 (day). */
  days: Date[];
  appointments: Appointment[];
  isLoading?: boolean;
  onSlotClick: (day: Date, slotIndex: number) => void;
  onAppointmentClick: (appointmentId: string) => void;
  /** Drops a dragged appointment onto a new day/slot, preserving its duration. */
  onAppointmentDrop: (appt: Appointment, day: Date, slotIndex: number) => void;
}

const HOURS = Array.from({ length: 24 }, (_, h) => h);

/**
 * The scrollable calendar surface: a sticky day header, a left hour gutter, and
 * one column per day with clickable 30-minute slots and absolutely-positioned
 * appointment cards. Shared by both the week and day views — only `days` differ.
 */
export function TimeGrid({
  days,
  appointments,
  isLoading,
  onSlotClick,
  onAppointmentClick,
  onAppointmentDrop,
}: TimeGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const didScroll = useRef(false);

  const { drag, draggingId, getCardDragProps, consumeClickAfterDrag } =
    useAppointmentDrag({
      days,
      bodyRef,
      scrollRef,
      onDrop: onAppointmentDrop,
    });

  // On first mount, scroll so the current time sits near the top of the view.
  useEffect(() => {
    if (didScroll.current || !scrollRef.current) return;
    const now = new Date();
    const offset =
      (minutesSinceMidnight(now) / SLOT_MINUTES) * SLOT_HEIGHT - SLOT_HEIGHT * 4;
    scrollRef.current.scrollTop = Math.max(0, offset);
    didScroll.current = true;
  }, []);

  const byDay = groupByDay(appointments);
  const gridTemplate = `${TIME_GUTTER_WIDTH}px repeat(${days.length}, minmax(0, 1fr))`;

  return (
    <div ref={scrollRef} className="relative flex-1 overflow-y-auto bg-card">
      {/* Sticky weekday header */}
      <div
        className="sticky top-0 z-20 grid border-b border-border bg-card"
        style={{ gridTemplateColumns: gridTemplate }}
      >
        <div className="border-r border-border" />
        {days.map((day) => {
          const today = isToday(day);
          return (
            <div
              key={dayKey(day)}
              className={cn(
                "flex h-16 flex-col items-center justify-center border-r border-border",
                today && "bg-primary/10",
              )}
            >
              <span
                className={cn(
                  "text-[11px] font-semibold tracking-wide uppercase",
                  today ? "text-primary" : "text-muted-foreground",
                )}
              >
                {weekdayShort(day)}
              </span>
              <span
                className={cn(
                  "text-xl font-semibold",
                  today ? "text-primary" : "text-foreground",
                )}
              >
                {day.getDate()}
              </span>
            </div>
          );
        })}
      </div>

      {/* Grid body */}
      <div
        ref={bodyRef}
        className="grid"
        style={{ gridTemplateColumns: gridTemplate }}
      >
        {/* Hour gutter */}
        <div className="relative" style={{ height: DAY_HEIGHT }}>
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="absolute right-1 -translate-y-1/2 text-[11px] text-muted-foreground/70"
              style={{ top: (hour * 60) / SLOT_MINUTES * SLOT_HEIGHT }}
            >
              {hour === 0 ? "" : formatHourLabel(hour * 2)}
            </div>
          ))}
        </div>

        {/* Day columns */}
        {days.map((day, dayIndex) => (
          <DayColumn
            key={dayKey(day)}
            day={day}
            appointments={byDay.get(dayKey(day)) ?? []}
            isLoading={isLoading}
            onSlotClick={onSlotClick}
            onAppointmentClick={onAppointmentClick}
            getCardDragProps={getCardDragProps}
            shouldIgnoreCardClick={consumeClickAfterDrag}
            draggingId={draggingId}
            preview={drag && drag.target.dayIndex === dayIndex ? drag : null}
          />
        ))}
      </div>
    </div>
  );
}

interface DayColumnProps {
  day: Date;
  appointments: Appointment[];
  isLoading?: boolean;
  onSlotClick: (day: Date, slotIndex: number) => void;
  onAppointmentClick: (appointmentId: string) => void;
  getCardDragProps: (appt: Appointment) => CardDragProps;
  shouldIgnoreCardClick: () => boolean;
  /** Id of the card currently being dragged (dimmed in place). */
  draggingId: string | null;
  /** Snap preview for this column while a card hovers over it, else null. */
  preview: ActiveDrag | null;
}

function DayColumn({
  day,
  appointments,
  isLoading,
  onSlotClick,
  onAppointmentClick,
  getCardDragProps,
  shouldIgnoreCardClick,
  draggingId,
  preview,
}: DayColumnProps) {
  const today = isToday(day);
  const positioned = layoutDayAppointments(appointments);

  return (
    <div
      className={cn(
        "relative border-r border-border",
        isWeekend(day) && "bg-muted/20",
        today && "bg-primary/5",
      )}
      style={{ height: DAY_HEIGHT }}
    >
      {/* Clickable 30-minute slots */}
      {Array.from({ length: SLOTS_PER_DAY }, (_, slotIndex) => (
        <button
          key={slotIndex}
          type="button"
          aria-label={`Novo agendamento às ${formatHourLabel(slotIndex)}`}
          onClick={() => onSlotClick(day, slotIndex)}
          className={cn(
            "block w-full cursor-pointer hover:bg-primary/10",
            // A heavier line at the top of each hour, lighter on the half-hour.
            slotIndex % 2 === 0
              ? "border-b border-border"
              : "border-b border-border/40",
          )}
          style={{ height: SLOT_HEIGHT }}
        />
      ))}

      {/* Appointment cards */}
      {!isLoading &&
        positioned.map((p) => (
          <AppointmentCard
            key={p.appt.id}
            positioned={p}
            onClick={onAppointmentClick}
            dragProps={getCardDragProps(p.appt)}
            shouldIgnoreClick={shouldIgnoreCardClick}
            isDragging={draggingId === p.appt.id}
          />
        ))}

      {/* Drop preview while dragging over this column */}
      {preview ? (
        <DropPreview
          slotIndex={preview.target.slotIndex}
          durationSlots={preview.durationSlots}
          type={preview.appt.type}
        />
      ) : null}

      {today ? <CurrentTimeIndicator /> : null}
    </div>
  );
}

/** Thin line marking the current time on today's column; ticks once a minute. */
function CurrentTimeIndicator() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const top = (minutesSinceMidnight(now) / SLOT_MINUTES) * SLOT_HEIGHT;

  return (
    <div
      className="pointer-events-none absolute right-0 left-0 z-20 flex items-center"
      style={{ top }}
    >
      <span className="size-2 -translate-x-1/2 rounded-full bg-destructive" />
      <span className="h-px flex-1 bg-destructive" />
    </div>
  );
}
