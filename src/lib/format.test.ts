import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatPhone,
} from "./format";

// Timezone is pinned to America/Sao_Paulo (UTC-3) in jest.setup.ts, so a noon-UTC
// instant lands on the same calendar day everywhere the suite runs.
const noonUtc = "2025-06-20T12:00:00.000Z";

/** Normalizes the non-breaking space Intl inserts so assertions read plainly. */
const nbsp = (s: string) => s.replace(/ /g, " ");

describe("formatDate", () => {
  it("formats an ISO string as dd/mm/aaaa (pt-BR default)", () => {
    expect(formatDate(noonUtc)).toBe("20/06/2025");
  });

  it("formats an ISO string as mm/dd/yyyy in English", () => {
    expect(formatDate(noonUtc, "en")).toBe("06/20/2025");
  });

  it("returns an em dash for null/undefined", () => {
    expect(formatDate(null)).toBe("—");
    expect(formatDate(undefined)).toBe("—");
    expect(formatDate(null, "en")).toBe("—");
  });

  it("returns an em dash for an unparseable date", () => {
    expect(formatDate("not-a-date")).toBe("—");
  });
});

describe("formatDateTime", () => {
  it("formats an ISO string as dd/mm/aaaa hh:mm (pt-BR default)", () => {
    expect(formatDateTime(noonUtc)).toBe("20/06/2025, 09:00");
  });

  it("formats date + time in English conventions", () => {
    const formatted = nbsp(formatDateTime(noonUtc, "en"));
    expect(formatted).toContain("06/20/2025");
    expect(formatted).toMatch(/09:00\s?AM/);
  });

  it("returns an em dash for missing input", () => {
    expect(formatDateTime(null)).toBe("—");
    expect(formatDateTime(null, "en")).toBe("—");
  });
});

describe("formatCurrency", () => {
  it("formats a number as BRL in pt-BR conventions (default)", () => {
    expect(nbsp(formatCurrency(1234.56))).toBe("R$ 1.234,56");
  });

  it("keeps BRL but uses English number conventions", () => {
    // Currency stays BRL; only separators/symbol placement follow the locale.
    expect(nbsp(formatCurrency(1234.56, "en"))).toMatch(/R\$\s?1,234\.56/);
  });

  it("returns an em dash for null/undefined/NaN", () => {
    expect(formatCurrency(null)).toBe("—");
    expect(formatCurrency(undefined)).toBe("—");
    expect(formatCurrency(Number.NaN)).toBe("—");
    expect(formatCurrency(null, "en")).toBe("—");
  });
});

describe("formatPhone", () => {
  it("formats a 13-digit BR mobile with country code", () => {
    expect(formatPhone("5511999998888")).toBe("+55 (11) 99999-8888");
  });

  it("formats an 11-digit number without country code", () => {
    expect(formatPhone("11999998888")).toBe("(11) 99999-8888");
  });

  it("returns the raw value for an unrecognized length", () => {
    expect(formatPhone("12345")).toBe("12345");
  });

  it("returns an em dash for missing input", () => {
    expect(formatPhone(null)).toBe("—");
    expect(formatPhone("")).toBe("—");
  });
});
