import { matchAcceptLanguage, pickLocale } from "./request";

describe("matchAcceptLanguage", () => {
  it("matches an English header", () => {
    expect(matchAcceptLanguage("en-US,en;q=0.9")).toBe("en");
  });

  it("maps any Portuguese variant to the pt-BR catalog", () => {
    expect(matchAcceptLanguage("pt-PT,pt;q=0.9")).toBe("pt-BR");
    expect(matchAcceptLanguage("pt-BR")).toBe("pt-BR");
  });

  it("honors quality-weight priority order", () => {
    expect(matchAcceptLanguage("fr;q=0.9,en;q=0.8,pt;q=1.0")).toBe("pt-BR");
  });

  it("returns undefined for unsupported or empty headers", () => {
    expect(matchAcceptLanguage("fr-FR,de;q=0.8")).toBeUndefined();
    expect(matchAcceptLanguage("")).toBeUndefined();
    expect(matchAcceptLanguage(null)).toBeUndefined();
  });
});

describe("pickLocale", () => {
  it("prefers a valid cookie over everything else", () => {
    expect(pickLocale({ cookie: "en", acceptLanguage: "pt-BR" })).toBe("en");
  });

  it("falls back to Accept-Language when no cookie is present", () => {
    expect(pickLocale({ cookie: undefined, acceptLanguage: "en-GB,en" })).toBe(
      "en",
    );
  });

  it("falls back to the default locale when nothing matches", () => {
    expect(pickLocale({ cookie: null, acceptLanguage: "fr-FR" })).toBe("pt-BR");
    expect(pickLocale({ cookie: "xx", acceptLanguage: null })).toBe("pt-BR");
  });
});
