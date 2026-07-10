import {
  createTemplateFormSchema,
  syncTemplatesSchema,
  templatesQuerySchema,
  toCreateTemplatePayload,
  type CreateTemplateForm,
} from "./template";

const baseForm: CreateTemplateForm = {
  name: "retorno_consulta",
  language: "pt_BR",
  category: "MARKETING",
  headerType: "NONE",
  headerText: "",
  headerMediaUrl: "",
  bodyText: "Olá {{nome}}, tudo bem?",
  footer: "",
  buttons: [],
  variableExamples: {},
};

describe("createTemplateFormSchema", () => {
  it("accepts a minimal valid template", () => {
    expect(createTemplateFormSchema.safeParse(baseForm).success).toBe(true);
  });

  it("rejects a name with uppercase letters (regex rule)", () => {
    const result = createTemplateFormSchema.safeParse({
      ...baseForm,
      name: "Retorno",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Apenas letras minúsculas, números e underscore.",
      );
    }
  });

  it("rejects an empty body", () => {
    const result = createTemplateFormSchema.safeParse({
      ...baseForm,
      bodyText: "   ",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a NONE header text with a line break", () => {
    const result = createTemplateFormSchema.safeParse({
      ...baseForm,
      headerText: "linha1\nlinha2",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === "headerText");
      expect(issue?.message).toBe("Sem quebras de linha.");
    }
  });

  it("rejects a NONE header text with an emoji", () => {
    const result = createTemplateFormSchema.safeParse({
      ...baseForm,
      headerText: "Bem-vindo 🎉",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === "headerText");
      expect(issue?.message).toBe("Sem emoji.");
    }
  });

  it("requires a media URL when the header type is IMAGE", () => {
    const result = createTemplateFormSchema.safeParse({
      ...baseForm,
      headerType: "IMAGE",
      headerMediaUrl: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find(
        (i) => i.path[0] === "headerMediaUrl",
      );
      expect(issue?.message).toBe("Envie a imagem do cabeçalho.");
    }
  });

  it("requires a valid http(s) URL for a URL button", () => {
    const result = createTemplateFormSchema.safeParse({
      ...baseForm,
      buttons: [{ type: "URL", text: "Abrir", url: "ftp://x" }],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find(
        (i) => i.path[0] === "buttons" && i.path[2] === "url",
      );
      expect(issue?.message).toBe("Informe uma URL válida (http/https).");
    }
  });
});

describe("toCreateTemplatePayload", () => {
  it("promotes a NONE header with text into a TEXT header", () => {
    const payload = toCreateTemplatePayload(
      { ...baseForm, headerType: "NONE", headerText: "Olá!" },
      ["nome"],
    );
    expect(payload.headerType).toBe("TEXT");
    expect(payload.headerText).toBe("Olá!");
  });

  it("keeps an IMAGE header with its media URL", () => {
    const payload = toCreateTemplatePayload(
      {
        ...baseForm,
        headerType: "IMAGE",
        headerMediaUrl: "https://cdn.example.com/x.png",
      },
      [],
    );
    expect(payload.headerType).toBe("IMAGE");
    expect(payload.headerMediaUrl).toBe("https://cdn.example.com/x.png");
  });

  it("prunes empty optionals (no footer, no buttons)", () => {
    const payload = toCreateTemplatePayload(baseForm, ["nome"]);
    expect(payload.footer).toBeUndefined();
    expect(payload.buttons).toBeUndefined();
  });

  it("keeps only example values for variables present in the body", () => {
    const payload = toCreateTemplatePayload(
      {
        ...baseForm,
        variableExamples: { nome: "Ana", sobrenome: "Souza" },
      },
      ["nome"], // only `nome` is a body variable
    );
    expect(payload.variableExamples).toEqual({ nome: "Ana" });
  });
});

describe("templatesQuerySchema / syncTemplatesSchema", () => {
  it("defaults page/limit and accepts an optional status", () => {
    const result = templatesQuerySchema.safeParse({ status: "APPROVED" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("rejects an unknown status", () => {
    expect(templatesQuerySchema.safeParse({ status: "NOPE" }).success).toBe(
      false,
    );
  });

  it("accepts a sync-all body (no templateId)", () => {
    expect(syncTemplatesSchema.safeParse({}).success).toBe(true);
  });
});
