"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * SSR-safe media-query hook. Returns whether `query` currently matches.
 *
 * Use this ONLY for behavioral branches that cannot be expressed with CSS
 * breakpoint utilities (e.g. deciding which single pane to render on mobile).
 * For pure show/hide layout, prefer Tailwind's `lg:hidden` / `hidden lg:flex`
 * to avoid a hydration flash.
 *
 * Backed by `useSyncExternalStore`: the server snapshot is `false`, so SSR and
 * hydration never mismatch, and the client snapshot reads the live match state
 * without syncing through an effect.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onStoreChange);
      return () => mql.removeEventListener("change", onStoreChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}
