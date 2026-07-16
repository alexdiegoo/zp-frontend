import { z } from "zod";

import { LOCALES } from "@/i18n/config";

/**
 * Shared locale schema (Principle V) — the single validation used by both the
 * client `<LocaleSwitcher>` and the `POST /api/preferences/locale` Route
 * Handler, so client-side UX and server-side security stay in lockstep.
 */
export const localeSchema = z.enum(LOCALES);

export type LocaleInput = z.infer<typeof localeSchema>;
