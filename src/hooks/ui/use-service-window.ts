import { useEffect, useMemo, useState } from "react";

import type { WindowStatus } from "@/types/chat";

const MINUTE_MS = 60_000;

/** Locally-recomputed 24h window state (derived from the server snapshot). */
export type ServiceWindowState = {
  /** When the window closes, or null when it never opened. */
  expiresAt: Date | null;
  /** Whether the window is open right now (recomputed locally as time passes). */
  isOpen: boolean;
  /** Human-friendly time remaining (e.g. `14h 23min`), or null when closed. */
  remainingLabel: string | null;
};

/**
 * Recomputes the 24h customer-service window locally from the server's
 * `windowStatus` snapshot. It ticks with a `setTimeout` (at most once per minute,
 * and exactly at expiry) so the countdown stays live and `isOpen` flips to
 * `false` when the window closes — without any extra network polling.
 * @param windowStatus - The server snapshot from the messages endpoint.
 * @returns The locally-derived window state.
 */
export function useServiceWindow(windowStatus: WindowStatus | undefined): ServiceWindowState {
  const expiresMs = windowStatus?.expiresAt ? new Date(windowStatus.expiresAt).getTime() : null;
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    if (expiresMs === null) return;

    const remaining = expiresMs - Date.now();
    if (remaining <= 0) return; // already closed — nothing to schedule

    // Re-render at the next minute boundary (for the countdown) or exactly at
    // expiry, whichever is sooner. The only state write is inside the timeout,
    // so this never loops synchronously.
    const id = setTimeout(() => setNowMs(Date.now()), Math.min(MINUTE_MS, remaining));
    return () => clearTimeout(id);
  }, [expiresMs, nowMs]);

  return useMemo(() => {
    if (expiresMs === null) {
      return { expiresAt: null, isOpen: false, remainingLabel: null };
    }

    const remaining = expiresMs - nowMs;
    const isOpen = remaining > 0;

    return {
      expiresAt: new Date(expiresMs),
      isOpen,
      remainingLabel: isOpen ? formatRemaining(remaining) : null,
    };
  }, [expiresMs, nowMs]);
}

function formatRemaining(ms: number): string {
  const totalMinutes = Math.floor(ms / MINUTE_MS);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) return `${hours}h ${minutes}min`;
  if (minutes > 0) return `${minutes}min`;
  return "menos de 1min";
}
