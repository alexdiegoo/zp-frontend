/** Locale-aware formatters for the pt-BR clinic UI. */

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

/** ISO string → `dd/mm/aaaa` (or `—` when missing/invalid). */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date);
}

/** ISO string → `dd/mm/aaaa hh:mm` (or `—` when missing/invalid). */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "—" : dateTimeFormatter.format(date);
}

/** Number → `R$ 1.234,56` (or `—` when missing). */
export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return currencyFormatter.format(value);
}

/**
 * Pretty-prints a Brazilian WhatsApp number when it looks like a raw digit
 * string (e.g. `5511999998888` → `+55 (11) 99999-8888`). Anything already
 * formatted or unrecognized is returned as-is.
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
