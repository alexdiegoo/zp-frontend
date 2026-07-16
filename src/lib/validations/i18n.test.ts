import { localeSchema } from "./i18n";

describe("localeSchema", () => {
  it("accepts the supported locales", () => {
    expect(localeSchema.parse("pt-BR")).toBe("pt-BR");
    expect(localeSchema.parse("en")).toBe("en");
  });

  it("rejects unknown values", () => {
    expect(localeSchema.safeParse("fr").success).toBe(false);
    expect(localeSchema.safeParse("EN").success).toBe(false);
    expect(localeSchema.safeParse("").success).toBe(false);
    expect(localeSchema.safeParse(undefined).success).toBe(false);
  });
});
