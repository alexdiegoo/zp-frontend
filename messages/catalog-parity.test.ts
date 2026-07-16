import en from "./en.json";
import ptBR from "./pt-BR.json";

/** Collects every leaf key as a dot-path, so nested namespaces are compared. */
function collectKeys(obj: unknown, prefix = ""): string[] {
  if (obj === null || typeof obj !== "object") return [prefix];
  return Object.entries(obj as Record<string, unknown>).flatMap(([key, value]) =>
    collectKeys(value, prefix ? `${prefix}.${key}` : key),
  );
}

describe("message catalog parity (FR-013 / SC-007)", () => {
  const ptKeys = new Set(collectKeys(ptBR));
  const enKeys = new Set(collectKeys(en));

  it("has no keys in pt-BR that are missing from en", () => {
    const missing = [...ptKeys].filter((key) => !enKeys.has(key));
    expect(missing).toEqual([]);
  });

  it("has no keys in en that are missing from pt-BR", () => {
    const orphaned = [...enKeys].filter((key) => !ptKeys.has(key));
    expect(orphaned).toEqual([]);
  });
});
