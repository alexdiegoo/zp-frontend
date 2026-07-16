import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";

import { DEFAULT_LOCALE, isLocale, LOCALES, type Locale } from "@/i18n/config";
import ptBR from "../../messages/pt-BR.json";

/**
 * Named format presets consumed by `useFormatter`/`getFormatter` and the
 * `lib/format.ts` wrappers (FR-009). Monetary amounts are always BRL; only the
 * formatting conventions (separators, symbol placement) follow the active
 * locale — see data-model Entity 4.
 */
export const formats = {
  dateTime: {
    shortDate: {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    },
    dateTime: {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  },
  number: {
    currency: {
      style: "currency",
      currency: "BRL",
    },
    percent: {
      style: "percent",
      maximumFractionDigits: 1,
    },
  },
} as const;

/** Reads a dot-path (`"namespace.key"`) from the default-locale catalog. */
function resolveDefault(path: string): string | undefined {
  const value = path
    .split(".")
    .reduce<unknown>(
      (acc, part) =>
        acc && typeof acc === "object"
          ? (acc as Record<string, unknown>)[part]
          : undefined,
      ptBR,
    );
  return typeof value === "string" ? value : undefined;
}

/**
 * Maps an `Accept-Language` header to a supported locale by matching the
 * highest-priority language range whose base language we support (`pt*` → the
 * pt-BR catalog, `en*` → English). Returns `undefined` when nothing matches.
 */
export function matchAcceptLanguage(
  header: string | null | undefined,
): Locale | undefined {
  if (!header) return undefined;

  const ranges = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params
        .map((p) => p.trim())
        .find((p) => p.startsWith("q="))
        ?.slice(2);
      return { tag: tag.toLowerCase(), q: q ? Number(q) : 1 };
    })
    .filter((r) => r.tag && !Number.isNaN(r.q))
    .sort((a, b) => b.q - a.q);

  for (const { tag } of ranges) {
    const base = tag.split("-")[0];
    const match = LOCALES.find((locale) => locale.toLowerCase().startsWith(base));
    if (match) return match;
  }
  return undefined;
}

/**
 * Resolution order (FR-006, FR-007): the `locale` cookie (set at login from the
 * account preference, or by the switcher) → browser `Accept-Language` for
 * first-time visitors → the default (`pt-BR`).
 */
export function pickLocale(input: {
  cookie?: string | null;
  acceptLanguage?: string | null;
}): Locale {
  if (isLocale(input.cookie)) return input.cookie;
  return matchAcceptLanguage(input.acceptLanguage) ?? DEFAULT_LOCALE;
}

/** Resolves the active locale for the current request from cookie + headers. */
export async function resolveLocale(): Promise<Locale> {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
  return pickLocale({
    cookie: cookieStore.get("locale")?.value,
    acceptLanguage: headerStore.get("accept-language"),
  });
}

export default getRequestConfig(async () => {
  const locale = await resolveLocale();

  const messages = (await import(`../../messages/${locale}.json`)).default;

  return {
    locale,
    messages,
    formats,
    // FR-008: a missing key never renders a raw key — fall back to the default
    // (pt-BR) string, and only the dot-path as a last resort.
    getMessageFallback({ namespace, key }) {
      const path = [namespace, key].filter(Boolean).join(".");
      return resolveDefault(path) ?? path;
    },
  };
});
