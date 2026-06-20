import type { Appointment } from "@/types/api";

/**
 * Calendar geometry + date helpers for the schedule page. The grid renders
 * 30-minute slots from 00:00 to 23:30; every position is derived from these
 * constants, so the cards line up with the slot rows exactly.
 *
 * All date math is local-time (the clinic's wall clock); ISO strings sent to /
 * received from the backend are produced via `Date#toISOString()` (UTC), which
 * round-trips correctly for display.
 */

export const SLOT_MINUTES = 30;
/** 48 half-hour slots in a day. */
export const SLOTS_PER_DAY = (24 * 60) / SLOT_MINUTES;
/** Pixel height of a single 30-minute slot row. */
export const SLOT_HEIGHT = 32;
/** Total scrollable height of one day column. */
export const DAY_HEIGHT = SLOTS_PER_DAY * SLOT_HEIGHT;
/** Width of the left hour-label gutter (shared by the grid template and drag math). */
export const TIME_GUTTER_WIDTH = 64;

export type ViewMode = "week" | "day";

/* --------------------------------- dates --------------------------------- */

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date: Date, amount: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + amount);
  return d;
}

/** Sunday-anchored start of the week containing `date` (matches the Dom–Sáb grid). */
export function startOfWeek(date: Date): Date {
  const d = startOfDay(date);
  return addDays(d, -d.getDay());
}

/** The seven days (Sun→Sat) of the week containing `date`. */
export function getWeekDays(date: Date): Date[] {
  const start = startOfWeek(date);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

/** Stable key for grouping appointments by their local calendar day. */
export function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

/** Minutes elapsed since local midnight. */
export function minutesSinceMidnight(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

/** The concrete Date for slot `index` (0 = 00:00, 1 = 00:30, …) on `day`. */
export function slotToDate(day: Date, slotIndex: number): Date {
  const d = startOfDay(day);
  d.setMinutes(slotIndex * SLOT_MINUTES);
  return d;
}

/* ------------------------------ formatting ------------------------------- */

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** "09:00" — 24h local time. */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Hour label for the time gutter, e.g. slot 16 → "08:00". */
export function formatHourLabel(slotIndex: number): string {
  const hour = Math.floor((slotIndex * SLOT_MINUTES) / 60);
  return `${String(hour).padStart(2, "0")}:00`;
}

/** "DOM", "SEG", … for the week header. */
export function weekdayShort(date: Date): string {
  return date
    .toLocaleDateString("pt-BR", { weekday: "short" })
    .replace(".", "")
    .slice(0, 3)
    .toUpperCase();
}

/** "Sexta-feira, 20 de junho de 2025" — header label for day view. */
export function formatDayLabel(date: Date): string {
  return cap(
    date.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
  );
}

/** "16 – 22 de junho de 2025" (collapses shared month/year) — header for week view. */
export function formatWeekRange(days: Date[]): string {
  const first = days[0];
  const last = days[days.length - 1];

  const dayNum = (d: Date) => d.getDate();
  const monthLong = (d: Date) =>
    d.toLocaleDateString("pt-BR", { month: "long" });
  const monthShort = (d: Date) =>
    d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
  const year = (d: Date) => d.getFullYear();

  if (year(first) !== year(last)) {
    return `${dayNum(first)} de ${monthShort(first)} de ${year(first)} – ${dayNum(
      last,
    )} de ${monthShort(last)} de ${year(last)}`;
  }
  if (first.getMonth() !== last.getMonth()) {
    return `${dayNum(first)} de ${monthShort(first)} – ${dayNum(
      last,
    )} de ${monthShort(last)} de ${year(last)}`;
  }
  return `${dayNum(first)} – ${dayNum(last)} de ${monthLong(first)} de ${year(
    first,
  )}`;
}

/* ---------------------------- card positioning --------------------------- */

export type PositionedAppointment = {
  appt: Appointment;
  /** Pixel offset from the top of the day column. */
  top: number;
  /** Pixel height of the card. */
  height: number;
  /** Column index within an overlapping cluster. */
  lane: number;
  /** Number of columns the cluster splits into. */
  lanes: number;
};

/**
 * Lays out a single day's appointments: computes each card's top/height from
 * its start/end, then splits overlapping appointments into side-by-side lanes
 * so none is fully hidden behind another.
 */
export function layoutDayAppointments(
  appointments: Appointment[],
): PositionedAppointment[] {
  const items = appointments
    .map((appt) => {
      const start = new Date(appt.startAt);
      const end = new Date(appt.endAt);
      const startMin = minutesSinceMidnight(start);
      const durationMin = Math.max(
        SLOT_MINUTES / 2,
        (end.getTime() - start.getTime()) / 60000,
      );
      return {
        appt,
        startMs: start.getTime(),
        endMs: end.getTime(),
        top: (startMin / SLOT_MINUTES) * SLOT_HEIGHT,
        height: (durationMin / SLOT_MINUTES) * SLOT_HEIGHT,
      };
    })
    .sort((a, b) => a.startMs - b.startMs || a.endMs - b.endMs);

  const result: PositionedAppointment[] = [];
  let cluster: typeof items = [];
  let clusterEnd = -Infinity;

  const flush = () => {
    const laneEnds: number[] = [];
    const lanes = cluster.map((item) => {
      let lane = laneEnds.findIndex((end) => item.startMs >= end);
      if (lane === -1) {
        lane = laneEnds.length;
        laneEnds.push(item.endMs);
      } else {
        laneEnds[lane] = item.endMs;
      }
      return lane;
    });
    const laneCount = laneEnds.length;
    cluster.forEach((item, i) => {
      result.push({
        appt: item.appt,
        top: item.top,
        height: item.height,
        lane: lanes[i],
        lanes: laneCount,
      });
    });
    cluster = [];
    clusterEnd = -Infinity;
  };

  for (const item of items) {
    if (cluster.length && item.startMs >= clusterEnd) flush();
    cluster.push(item);
    clusterEnd = Math.max(clusterEnd, item.endMs);
  }
  flush();

  return result;
}

/** Groups appointments by the local day of their `startAt` (keyed by {@link dayKey}). */
export function groupByDay(
  appointments: Appointment[],
): Map<string, Appointment[]> {
  const map = new Map<string, Appointment[]>();
  for (const appt of appointments) {
    const key = dayKey(new Date(appt.startAt));
    const bucket = map.get(key);
    if (bucket) bucket.push(appt);
    else map.set(key, [appt]);
  }
  return map;
}
