/**
 * Locale-aware formatters. The active language sourced from the `locale`
 * cookie/switcher is applied via next-intl; these wrappers keep their original
 * signatures (an optional `locale` argument defaults to the app default) so
 * existing call sites keep compiling, while components that need the value to
 * re-render on a language switch use {@link useFormatters}.
 *
 * Monetary amounts are always BRL; only the formatting conventions (separators,
 * symbol placement) follow the active locale (data-model Entity 4, FR-010 keeps
 * `formatPhone` as business data).
 */

import { useLocale } from "next-intl";

import { DEFAULT_LOCALE, type Locale } from "@/i18n/config";

const dateFormatters = new Map<Locale, Intl.DateTimeFormat>();
const dateTimeFormatters = new Map<Locale, Intl.DateTimeFormat>();
const currencyFormatters = new Map<Locale, Intl.NumberFormat>();

function dateFormatter(locale: Locale) {
  let fmt = dateFormatters.get(locale);
  if (!fmt) {
    fmt = new Intl.DateTimeFormat(locale, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    dateFormatters.set(locale, fmt);
  }
  return fmt;
}

function dateTimeFormatter(locale: Locale) {
  let fmt = dateTimeFormatters.get(locale);
  if (!fmt) {
    fmt = new Intl.DateTimeFormat(locale, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    dateTimeFormatters.set(locale, fmt);
  }
  return fmt;
}

function currencyFormatter(locale: Locale) {
  let fmt = currencyFormatters.get(locale);
  if (!fmt) {
    fmt = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "BRL",
    });
    currencyFormatters.set(locale, fmt);
  }
  return fmt;
}

/** ISO string → localized short date (or `—` when missing/invalid). */
export function formatDate(
  iso: string | null | undefined,
  locale: Locale = DEFAULT_LOCALE,
): string {
  if (!iso) return "—";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "—" : dateFormatter(locale).format(date);
}

/** ISO string → localized date + time (or `—` when missing/invalid). */
export function formatDateTime(
  iso: string | null | undefined,
  locale: Locale = DEFAULT_LOCALE,
): string {
  if (!iso) return "—";
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? "—"
    : dateTimeFormatter(locale).format(date);
}

/** Number → BRL formatted per the active locale (or `—` when missing). */
export function formatCurrency(
  value: number | null | undefined,
  locale: Locale = DEFAULT_LOCALE,
): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return currencyFormatter(locale).format(value);
}

/**
 * Reactive formatters bound to the active locale — for client components that
 * must re-render dates/currency when the language is switched (SC-005). Server
 * components can call the plain functions with `await getLocale()`.
 */
export function useFormatters() {
  const locale = useLocale();
  return {
    formatDate: (iso: string | null | undefined) => formatDate(iso, locale),
    formatDateTime: (iso: string | null | undefined) =>
      formatDateTime(iso, locale),
    formatCurrency: (value: number | null | undefined) =>
      formatCurrency(value, locale),
  };
}

/**
 * Pretty-prints a Brazilian WhatsApp number when it looks like a raw digit
 * string (e.g. `5511999998888` → `+55 (11) 99999-8888`). Anything already
 * formatted or unrecognized is returned as-is. Business data (FR-010) — the
 * format never changes with the UI language.
 */
export function formatPhone(raw: string | null | undefined): string {
  if (!raw) return "—";
  const digits = raw.replace(/\D/g, "");

  // 55 (country) + 2 (area) + 9 (mobile)
  if (digits.length === 13 && digits.startsWith("55")) {
    const area = digits.slice(2, 4);
    const part1 = digits.slice(4, 9);
    const part2 = digits.slice(9);
    return `+55 (${area}) ${part1}-${part2}`;
  }
  // 2 (area) + 9 (mobile), no country code
  if (digits.length === 11) {
    const area = digits.slice(0, 2);
    const part1 = digits.slice(2, 7);
    const part2 = digits.slice(7);
    return `(${area}) ${part1}-${part2}`;
  }
  return raw;
}
