"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import type { Locale } from "@/i18n/config";
import { sendJson } from "@/lib/api/http";

export const localeKeys = {
  preference: ["locale", "preference"] as const,
};

type SetLocaleResponse = { data: { locale: Locale } };

/**
 * The only client path that changes the language (Principle III): POSTs the
 * chosen locale to the BFF, then `router.refresh()` re-runs the server render in
 * the new language without a full reload (SC-002). React preserves client
 * component state across the soft refresh, so unsaved form input survives
 * (FR-004).
 */
export function useSetLocale() {
  const router = useRouter();

  return useMutation({
    mutationFn: (locale: Locale) =>
      sendJson<SetLocaleResponse>("/api/preferences/locale", { locale }),
    onSuccess: () => router.refresh(),
  });
}
