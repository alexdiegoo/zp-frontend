import type { Locale } from "@/i18n/config";
import type { formats } from "@/i18n/request";
import type messages from "../messages/pt-BR.json";

/**
 * Augments next-intl's `AppConfig` so translation keys, the active locale, and
 * named format presets are all type-checked (Principle VIII, FR-013). Mistyped
 * or removed keys become compile errors; `pt-BR.json` is the base catalog.
 */
declare module "next-intl" {
  interface AppConfig {
    Locale: Locale;
    Messages: typeof messages;
    Formats: typeof formats;
  }
}
