import { renderWithProviders, screen } from "@/test/utils";

// The footer is an async Server Component using `getTranslations`. Mock the
// next-intl server API with a real `use-intl` translator over the pt-BR catalog
// so keys (and ICU/rich markup) resolve exactly as in production.
jest.mock("next-intl/server", () => {
  const actual = jest.requireActual("next-intl/server");
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- jest.mock factories are hoisted; ESM import is not allowed here
  const { createTranslator } = require("use-intl");
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- same
  const messages = require("../../../messages/pt-BR.json");
  return {
    ...actual,
    getTranslations: async (namespace: string) =>
      createTranslator({ locale: "pt-BR", messages, namespace }),
  };
});

import { LandingFooter } from "./landing-footer";

describe("LandingFooter", () => {
  it("links 'Política de privacidade' to the /privacidade route", async () => {
    // LandingFooter is an async Server Component (uses getTranslations); resolve
    // it to its element tree before rendering with the app providers.
    renderWithProviders(await LandingFooter());
    const link = screen.getByRole("link", { name: "Política de privacidade" });
    expect(link).toHaveAttribute("href", "/privacidade");
  });
});
