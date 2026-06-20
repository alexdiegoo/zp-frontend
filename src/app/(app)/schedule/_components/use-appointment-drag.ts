"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  SLOT_HEIGHT,
  SLOT_MINUTES,
  SLOTS_PER_DAY,
  TIME_GUTTER_WIDTH,
} from "@/lib/calendar";
import type { Appointment } from "@/types/api";

/** Pixels the pointer must travel before a press becomes a drag (vs. a click). */
const DRAG_THRESHOLD = 4;
/** Distance from a scroll edge that starts auto-scrolling while dragging. */
const EDGE_SIZE = 56;
/** Max auto-scroll speed in px per animation frame. */
const EDGE_SPEED = 14;

/** Where a dragged card currently snaps: which day column and which 30-min slot. */
export type DragTarget = { dayIndex: number; slotIndex: number };

/** Live state exposed to the grid so it can render the drop preview + dim the original. */
export type ActiveDrag = {
  appt: Appointment;
  /** Card height in slot units, used to size the snap preview. */
  durationSlots: number;
  target: DragTarget;
};

/** Pointer handlers bound to a single card so it can be picked up and dragged. */
export type CardDragProps = {
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
  onPointerCancel: (e: React.PointerEvent) => void;
  onLostPointerCapture: (e: React.PointerEvent) => void;
};

interface Options {
  /** The rendered day columns (length differs between week and day views). */
  days: Date[];
  /** The grid body element (gutter + columns) — drag math is relative to its box. */
  bodyRef: React.RefObject<HTMLDivElement | null>;
  /** The scroll viewport, used for edge auto-scroll. */
  scrollRef: React.RefObject<HTMLDivElement | null>;
  /** Called once on drop when the card lands on a different slot/column. */
  onDrop: (appt: Appointment, day: Date, slotIndex: number) => void;
}

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));

/**
 * Custom pointer-based drag-and-drop for moving appointment cards between time
 * slots and day columns. We roll our own (no DnD lib) because dropping needs to
 * snap to the 30-minute grid and resolve the target column from geometry — both
 * are trivial with the calendar's pixel constants.
 *
 * Each card captures the pointer on press, so move/up events keep firing on it
 * even as the pointer travels across columns. A press only becomes a drag after
 * the pointer moves past {@link DRAG_THRESHOLD}, so plain clicks (open details)
 * and slot clicks still work. While dragging near the viewport edges the grid
 * auto-scrolls so off-screen hours stay reachable.
 */
export function useAppointmentDrag({ days, bodyRef, scrollRef, onDrop }: Options) {
  // Non-null only once a press has crossed the drag threshold; drives the
  // preview overlay and the dimming of the original card.
  const [drag, setDrag] = useState<ActiveDrag | null>(null);

  // Mutable per-press session — kept in a ref so move handlers read fresh values
  // without re-binding. Set on pointerdown, cleared on release.
  const session = useRef<{
    appt: Appointment;
    durationSlots: number;
    pointerId: number;
    startX: number;
    startY: number;
    /** Pointer offset from the card's top edge at grab time (px). */
    grabOffsetY: number;
    lastX: number;
    lastY: number;
    moved: boolean;
    target: DragTarget;
  } | null>(null);

  // Set true on drop so the click firing right after a drag is swallowed.
  const draggedRef = useRef(false);
  const rafId = useRef<number | null>(null);
  // Indirection so the rAF loop can re-schedule itself without a forward ref.
  const tickRef = useRef<() => void>(() => {});

  /** Resolve the snap target (column + slot) from an absolute pointer position. */
  const resolveTarget = useCallback(
    (clientX: number, clientY: number): DragTarget | null => {
      const body = bodyRef.current;
      const s = session.current;
      if (!body || !s) return null;

      const rect = body.getBoundingClientRect();
      const cols = days.length;
      const colWidth = (rect.width - TIME_GUTTER_WIDTH) / cols;
      const relX = clientX - rect.left - TIME_GUTTER_WIDTH;
      const dayIndex = clamp(Math.floor(relX / colWidth), 0, cols - 1);

      const topPx = clientY - rect.top - s.grabOffsetY;
      const slotIndex = clamp(
        Math.round(topPx / SLOT_HEIGHT),
        0,
        SLOTS_PER_DAY - s.durationSlots,
      );

      return { dayIndex, slotIndex };
    },
    [bodyRef, days.length],
  );

  /** Apply a freshly-resolved target to both the session ref and render state. */
  const applyTarget = useCallback((next: DragTarget) => {
    const s = session.current;
    if (!s) return;
    s.target = next;
    setDrag((d) => (d ? { ...d, target: next } : d));
  }, []);

  const stopAutoScroll = useCallback(() => {
    if (rafId.current != null) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
  }, []);

  /** Auto-scroll loop while the pointer rests near a vertical edge. */
  const tickAutoScroll = useCallback(() => {
    rafId.current = null;
    const scroller = scrollRef.current;
    const s = session.current;
    if (!scroller || !s) return;

    const rect = scroller.getBoundingClientRect();
    const y = s.lastY;
    let delta = 0;
    if (y < rect.top + EDGE_SIZE) {
      delta = -EDGE_SPEED * (1 - (y - rect.top) / EDGE_SIZE);
    } else if (y > rect.bottom - EDGE_SIZE) {
      delta = EDGE_SPEED * (1 - (rect.bottom - y) / EDGE_SIZE);
    }
    if (delta === 0) return; // pointer left the edge — loop ends until next move

    const before = scroller.scrollTop;
    scroller.scrollTop = before + delta;
    // The grid moved under a stationary pointer — recompute the snap target.
    if (scroller.scrollTop !== before) {
      const next = resolveTarget(s.lastX, s.lastY);
      if (next) applyTarget(next);
    }
    rafId.current = requestAnimationFrame(() => tickRef.current());
  }, [scrollRef, resolveTarget, applyTarget]);

  useEffect(() => {
    tickRef.current = tickAutoScroll;
  }, [tickAutoScroll]);

  const maybeAutoScroll = useCallback(() => {
    if (rafId.current == null) {
      rafId.current = requestAnimationFrame(() => tickRef.current());
    }
  }, []);

  /** Begin a potential drag from a card's `pointerdown`. */
  const startDrag = useCallback(
    (e: React.PointerEvent, appt: Appointment) => {
      if (e.button !== 0) return; // left button / touch / pen only

      const cardRect = e.currentTarget.getBoundingClientRect();
      const durationMs =
        new Date(appt.endAt).getTime() - new Date(appt.startAt).getTime();
      const durationSlots = clamp(
        Math.round(durationMs / 60_000 / SLOT_MINUTES),
        1,
        SLOTS_PER_DAY,
      );

      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // Capture is best-effort; the drag still works without it.
      }

      draggedRef.current = false;
      session.current = {
        appt,
        durationSlots,
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        grabOffsetY: e.clientY - cardRect.top,
        lastX: e.clientX,
        lastY: e.clientY,
        moved: false,
        target: { dayIndex: 0, slotIndex: 0 },
      };
    },
    [],
  );

  const handleMove = useCallback(
    (e: React.PointerEvent) => {
      const s = session.current;
      if (!s || e.pointerId !== s.pointerId) return;

      s.lastX = e.clientX;
      s.lastY = e.clientY;

      if (!s.moved) {
        if (
          Math.abs(e.clientX - s.startX) < DRAG_THRESHOLD &&
          Math.abs(e.clientY - s.startY) < DRAG_THRESHOLD
        ) {
          return;
        }
        s.moved = true;
        setDrag({
          appt: s.appt,
          durationSlots: s.durationSlots,
          target: s.target,
        });
      }

      const next = resolveTarget(e.clientX, e.clientY);
      if (next) applyTarget(next);
      maybeAutoScroll();
    },
    [resolveTarget, applyTarget, maybeAutoScroll],
  );

  const finishDrag = useCallback(
    (commit: boolean) => {
      const s = session.current;
      stopAutoScroll();
      session.current = null;
      setDrag(null);
      if (!s) return;
      if (commit && s.moved) {
        draggedRef.current = true;
        onDrop(s.appt, days[s.target.dayIndex], s.target.slotIndex);
      }
    },
    [stopAutoScroll, onDrop, days],
  );

  const handleUp = useCallback(
    (e: React.PointerEvent) => {
      const s = session.current;
      if (!s || e.pointerId !== s.pointerId) return;
      finishDrag(true);
    },
    [finishDrag],
  );

  const handleCancel = useCallback(() => finishDrag(false), [finishDrag]);

  useEffect(() => () => stopAutoScroll(), [stopAutoScroll]);

  /** Pointer handlers to spread onto a card so it can be dragged. */
  const getCardDragProps = useCallback(
    (appt: Appointment): CardDragProps => ({
      onPointerDown: (e) => startDrag(e, appt),
      onPointerMove: handleMove,
      onPointerUp: handleUp,
      onPointerCancel: handleCancel,
      onLostPointerCapture: handleCancel,
    }),
    [startDrag, handleMove, handleUp, handleCancel],
  );

  /** True if the click currently firing was the tail end of a drag (swallow it). */
  const consumeClickAfterDrag = useCallback(() => {
    if (draggedRef.current) {
      draggedRef.current = false;
      return true;
    }
    return false;
  }, []);

  return {
    /** Non-null while a card is being dragged; drives the preview. */
    drag,
    /** Id of the card being dragged (dimmed in place). */
    draggingId: drag?.appt.id ?? null,
    getCardDragProps,
    consumeClickAfterDrag,
  };
}
