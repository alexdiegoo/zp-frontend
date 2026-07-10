import {
  aiFeedbackStatusLabel,
  aiFeedbackStatusVariant,
  extractTemplateVariables,
  formatTemplateLanguage,
  templateCategoryLabel,
  templateStatusLabel,
  templateStatusVariant,
} from "./template-display";

describe("templateStatusLabel / templateStatusVariant", () => {
  it("maps a known status to its pt-BR label and variant", () => {
    expect(templateStatusLabel("APPROVED")).toBe("Aprovado");
    expect(templateStatusVariant("APPROVED")).toBe("default");
    expect(templateStatusVariant("REJECTED")).toBe("destructive");
  });

  it("falls back to the raw value / outline for an unknown status", () => {
    expect(templateStatusLabel("SOMETHING_NEW")).toBe("SOMETHING_NEW");
    expect(templateStatusVariant("SOMETHING_NEW")).toBe("outline");
  });
});

describe("aiFeedbackStatusLabel / aiFeedbackStatusVariant", () => {
  it("maps a known AI feedback status", () => {
    expect(aiFeedbackStatusLabel("WARNING")).toBe("Com alertas");
    expect(aiFeedbackStatusVariant("WARNING")).toBe("outline");
  });

  it("falls back to secondary for an unknown status", () => {
    expect(aiFeedbackStatusVariant("MYSTERY")).toBe("secondary");
  });
});

describe("templateCategoryLabel / formatTemplateLanguage", () => {
  it("maps known categories and languages", () => {
    expect(templateCategoryLabel("MARKETING")).toBe("Marketing");
    expect(formatTemplateLanguage("pt_BR")).toBe("Português (BR)");
  });

  it("falls back to the raw value when unmapped", () => {
    expect(templateCategoryLabel("FOO")).toBe("FOO");
    expect(formatTemplateLanguage("fr_FR")).toBe("fr_FR");
  });
});

describe("extractTemplateVariables", () => {
  it("extracts unique variables preserving first-seen order", () => {
    expect(
      extractTemplateVariables("Olá {{nome}}, sua consulta com {{medico}} é amanhã, {{nome}}."),
    ).toEqual(["nome", "medico"]);
  });

  it("returns an empty array when there are no variables", () => {
    expect(extractTemplateVariables("Sem variáveis aqui.")).toEqual([]);
  });

  it("ignores malformed braces", () => {
    expect(extractTemplateVariables("{{ invalid space }} {{ok}}")).toEqual(["ok"]);
  });
});
