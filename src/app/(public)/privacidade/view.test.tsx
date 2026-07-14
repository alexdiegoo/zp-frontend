import { render, screen } from "@/test/utils";

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
  it("renders the page title and the last-updated date", () => {
    render(<PrivacyPolicyView />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Política de Privacidade" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(POLICY_METADATA.effectiveDate)),
    ).toBeInTheDocument();
  });

  it.each(REQUIRED_SECTIONS)(
    "renders the '%s' section with a heading and a stable anchor id",
    (id, title) => {
      const { container } = render(<PrivacyPolicyView />);
      expect(container.querySelector(`#${id}`)).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
    },
  );

  it("names Meta and WhatsApp as data recipients in the sharing section", () => {
    const { container } = render(<PrivacyPolicyView />);
    const section = container.querySelector("#compartilhamento");
    expect(section?.textContent).toMatch(/Meta/);
    expect(section?.textContent).toMatch(/WhatsApp/);
  });

  it("states the deletion contact channel and handling timeframe", () => {
    const { container } = render(<PrivacyPolicyView />);
    const section = container.querySelector("#exclusao-de-dados");
    expect(section?.textContent).toContain(POLICY_METADATA.dataDeletion.channel);
    expect(section?.textContent).toContain(POLICY_METADATA.dataDeletion.timeframe);
  });

  it("enumerates the LGPD rights", () => {
    const { container } = render(<PrivacyPolicyView />);
    const section = container.querySelector("#seus-direitos");
    const text = section?.textContent ?? "";
    expect(text).toMatch(/Acesso/);
    expect(text).toMatch(/Correção/);
    expect(text).toMatch(/Exclusão/);
    expect(text).toMatch(/Portabilidade/);
    expect(text).toMatch(/Revogação do consentimento/);
  });

  it("surfaces the data controller and privacy contact", () => {
    const { container } = render(<PrivacyPolicyView />);
    const section = container.querySelector("#controlador-e-contato");
    expect(section?.textContent).toContain(POLICY_METADATA.controller);
    expect(section?.textContent).toContain(POLICY_METADATA.contactChannel);
  });
});
