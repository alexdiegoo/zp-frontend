/**
 * Static i18n configuration — the single source of truth for the set of
 * supported languages, the default, and their native display labels.
 *
 * `pt-BR` is the default locale and the base for type inference
 * (`AppConfig.Messages` is derived from `messages/pt-BR.json`).
 */

export const LOCALES = ["pt-BR", "en"] as const;

export const DEFAULT_LOCALE: Locale = "pt-BR";

export type Locale = (typeof LOCALES)[number];

/** Native display names shown in the language switcher. */
export const LOCALE_LABELS: Record<Locale, string> = {
  "pt-BR": "Português (Brasil)",
  en: "English",
};

/** Narrows an arbitrary string to a supported `Locale`. */
export function isLocale(value: string | undefined | null): value is Locale {
  return value != null && (LOCALES as readonly string[]).includes(value);
}
