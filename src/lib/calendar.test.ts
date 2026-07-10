import { makeAppointment } from "@/test/fixtures";

import {
  addDays,
  dayKey,
  formatWeekRange,
  getWeekDays,
  groupByDay,
  isSameDay,
  isToday,
  isWeekend,
  layoutDayAppointments,
  minutesSinceMidnight,
  slotToDate,
  startOfDay,
  startOfWeek,
} from "./calendar";

// June 20 2025 is a Friday. Dates are built with the LOCAL constructor so the
// day-component math is timezone-independent.
const friday = () => new Date(2025, 5, 20);

describe("date math", () => {
  it("startOfDay zeroes the time", () => {
    const d = startOfDay(new Date(2025, 5, 20, 14, 37, 9));
    expect(d.getHours()).toBe(0);
    expect(d.getMinutes()).toBe(0);
  });

  it("addDays shifts by whole days", () => {
    expect(addDays(friday(), 3).getDate()).toBe(23);
  });

  it("startOfWeek anchors to the preceding Sunday", () => {
    const sunday = startOfWeek(friday());
    expect(sunday.getDay()).toBe(0);
    expect(sunday.getDate()).toBe(15);
  });

  it("getWeekDays returns 7 consecutive days Sun→Sat", () => {
    const days = getWeekDays(friday());
    expect(days).toHaveLength(7);
    expect(days[0].getDate()).toBe(15);
    expect(days[6].getDate()).toBe(21);
  });

  it("isSameDay compares calendar day only", () => {
    expect(isSameDay(new Date(2025, 5, 20, 8), new Date(2025, 5, 20, 22))).toBe(
      true,
    );
    expect(isSameDay(friday(), new Date(2025, 5, 21))).toBe(false);
  });

  it("isWeekend is true for Saturday and Sunday", () => {
    expect(isWeekend(new Date(2025, 5, 21))).toBe(true); // Sat
    expect(isWeekend(new Date(2025, 5, 22))).toBe(true); // Sun
    expect(isWeekend(friday())).toBe(false);
  });

  it("dayKey is stable per local calendar day", () => {
    expect(dayKey(friday())).toBe("2025-5-20");
  });

  it("minutesSinceMidnight / slotToDate are inverse across slots", () => {
    expect(minutesSinceMidnight(new Date(2025, 5, 20, 8, 30))).toBe(510);
    const slot = slotToDate(friday(), 16); // 16 * 30min = 08:00
    expect(slot.getHours()).toBe(8);
    expect(slot.getMinutes()).toBe(0);
  });
});

describe("isToday (fixed clock)", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("is true only for the current local day", () => {
    jest.setSystemTime(new Date(2025, 5, 20, 10, 0, 0));
    expect(isToday(friday())).toBe(true);
    expect(isToday(new Date(2025, 5, 21))).toBe(false);
  });
});

describe("formatWeekRange", () => {
  it("collapses a within-month week", () => {
    expect(formatWeekRange(getWeekDays(friday()))).toBe(
      "15 – 21 de junho de 2025",
    );
  });

  it("expands across a month boundary", () => {
    // Week of Sun June 29 → Sat July 5, 2025.
    expect(formatWeekRange(getWeekDays(new Date(2025, 5, 29)))).toBe(
      "29 de jun – 5 de jul de 2025",
    );
  });
});

describe("layoutDayAppointments", () => {
  it("splits overlapping appointments into side-by-side lanes", () => {
    const a = makeAppointment({
      id: "a",
      startAt: "2025-06-20T09:00:00",
      endAt: "2025-06-20T10:00:00",
    });
    const b = makeAppointment({
      id: "b",
      startAt: "2025-06-20T09:30:00",
      endAt: "2025-06-20T10:30:00",
    });
    const c = makeAppointment({
      id: "c",
      startAt: "2025-06-20T11:00:00",
      endAt: "2025-06-20T11:30:00",
    });

    const positioned = layoutDayAppointments([a, b, c]);
    const byId = Object.fromEntries(positioned.map((p) => [p.appt.id, p]));

    // a & b overlap → two lanes in that cluster.
    expect(byId.a.lanes).toBe(2);
    expect(byId.b.lanes).toBe(2);
    expect(byId.a.lane).not.toBe(byId.b.lane);

    // c is a separate, non-overlapping cluster → single lane.
    expect(byId.c.lanes).toBe(1);

    // top is proportional to start time (09:00 = 540min → 18 slots * 32px).
    expect(byId.a.top).toBe(576);
  });

  it("floors the card height for a zero/short duration", () => {
    const z = makeAppointment({
      id: "z",
      startAt: "2025-06-20T09:00:00",
      endAt: "2025-06-20T09:00:00",
    });
    const [pos] = layoutDayAppointments([z]);
    // min duration = SLOT_MINUTES/2 = 15min → (15/30)*32 = 16px.
    expect(pos.height).toBe(16);
  });
});

describe("groupByDay", () => {
  it("buckets appointments by their local start day", () => {
    const map = groupByDay([
      makeAppointment({ id: "1", startAt: "2025-06-20T09:00:00" }),
      makeAppointment({ id: "2", startAt: "2025-06-20T14:00:00" }),
      makeAppointment({ id: "3", startAt: "2025-06-21T09:00:00" }),
    ]);
    expect(map.size).toBe(2);
    expect(map.get("2025-5-20")).toHaveLength(2);
    expect(map.get("2025-5-21")).toHaveLength(1);
  });
});
