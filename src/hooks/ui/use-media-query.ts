"use client";

import { useEffect, useState } from "react";

/**
 * SSR-safe media-query hook. Returns whether `query` currently matches.
 *
 * Use this ONLY for behavioral branches that cannot be expressed with CSS
 * breakpoint utilities (e.g. deciding which single pane to render on mobile).
 * For pure show/hide layout, prefer Tailwind's `lg:hidden` / `hidden lg:flex`
 * to avoid a hydration flash.
 *
 * During SSR and the first client render it returns `false`, then syncs to the
 * real value in an effect, so it never causes a hydration mismatch.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);

    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}
