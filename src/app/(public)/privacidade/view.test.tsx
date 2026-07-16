import { render, screen } from "@/test/utils";

// PrivacyPolicyView is an async Server Component using `getTranslations`. Resolve
// keys with a real `use-intl` translator over the pt-BR catalog, and stub the
// (also async) landing chrome so only the page's own tree needs awaiting.
jest.mock("next-intl/server", () => {
  const actual = jest.requireActual("next-intl/server");
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- jest.mock factories are hoisted; ESM import is not allowed here
  const { createTranslator } = require("use-intl");
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- same
  const messages = require("../../../../messages/pt-BR.json");
  return {
    ...actual,
    getTranslations: async (namespace: string) =>
      createTranslator({ locale: "pt-BR", messages, namespace }),
  };
});

jest.mock("@/components/landing/landing-header", () => ({
  LandingHeader: () => null,
}));
jest.mock("@/components/landing/landing-footer", () => ({
  LandingFooter: () => null,
}));

import { PrivacyPolicyView } from "./view";
import { POLICY_METADATA } from "./_content";

/** The sections the policy must expose (anchor id → heading text). */
const REQUIRED_SECTIONS = [
  ["introducao", "1. Introdução"],
  ["dados-coletados", "2. Dados que coletamos"],
  ["uso-dos-dados", "3. Como usamos os dados"],
  ["compartilhamento", "4. Compartilhamento com terceiros"],
  ["retencao", "5. Retenção dos dados"],
  ["seus-direitos", "6. Seus direitos (LGPD)"],
  ["exclusao-de-dados", "7. Exclusão de dados"],
  ["controlador-e-contato", "8. Controlador e contato"],
] as const;

describe("PrivacyPolicyView", () => {
  it("renders the page title and the last-updated date", async () => {
    render(await PrivacyPolicyView());
    expect(
      screen.getByRole("heading", { level: 1, name: "Política de Privacidade" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(POLICY_METADATA.effectiveDate)),
    ).toBeInTheDocument();
  });

  it.each(REQUIRED_SECTIONS)(
    "renders the '%s' section with a heading and a stable anchor id",
    async (id, title) => {
      const { container } = render(await PrivacyPolicyView());
      expect(container.querySelector(`#${id}`)).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
    },
  );

  it("names Meta and WhatsApp as data recipients in the sharing section", async () => {
    const { container } = render(await PrivacyPolicyView());
    const section = container.querySelector("#compartilhamento");
    expect(section?.textContent).toMatch(/Meta/);
    expect(section?.textContent).toMatch(/WhatsApp/);
  });

  it("states the deletion contact channel and handling timeframe", async () => {
    const { container } = render(await PrivacyPolicyView());
    const section = container.querySelector("#exclusao-de-dados");
    expect(section?.textContent).toContain(POLICY_METADATA.dataDeletion.channel);
    expect(section?.textContent).toContain(POLICY_METADATA.dataDeletion.timeframe);
  });

  it("enumerates the LGPD rights", async () => {
    const { container } = render(await PrivacyPolicyView());
    const section = container.querySelector("#seus-direitos");
    const text = section?.textContent ?? "";
    expect(text).toMatch(/Acesso/);
    expect(text).toMatch(/Correção/);
    expect(text).toMatch(/Exclusão/);
    expect(text).toMatch(/Portabilidade/);
    expect(text).toMatch(/Revogação do consentimento/);
  });

  it("surfaces the data controller and privacy contact", async () => {
    const { container } = render(await PrivacyPolicyView());
    const section = container.querySelector("#controlador-e-contato");
    expect(section?.textContent).toContain(POLICY_METADATA.controller);
    expect(section?.textContent).toContain(POLICY_METADATA.contactChannel);
  });
});
