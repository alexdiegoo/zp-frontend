import {
  campaignsQuerySchema,
  createCampaignSchema,
} from "./campaign";

describe("createCampaignSchema — OFFICIAL channel", () => {
  const validOfficial = {
    apiType: "OFFICIAL" as const,
    name: "Retorno pós-consulta",
    waPhoneNumberId: "wa_1",
    messageTemplateId: "tpl_1",
    contactIds: ["c_1", "c_2"],
  };

  it("accepts a complete official campaign", () => {
    expect(createCampaignSchema.safeParse(validOfficial).success).toBe(true);
  });

  it("requires at least one contact", () => {
    const result = createCampaignSchema.safeParse({
      ...validOfficial,
      contactIds: [],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Selecione ao menos um contato.",
      );
    }
  });

  it("requires a WhatsApp sender number", () => {
    const result = createCampaignSchema.safeParse({
      ...validOfficial,
      waPhoneNumberId: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Selecione um número de WhatsApp.",
      );
    }
  });
});

describe("createCampaignSchema — UNOFFICIAL channel", () => {
  const validUnofficial = {
    apiType: "UNOFFICIAL" as const,
    name: "Promoção de julho",
    message: "Olá! Temos novidades para você neste mês.",
  };

  it("accepts a message-only unofficial campaign", () => {
    expect(createCampaignSchema.safeParse(validUnofficial).success).toBe(true);
  });

  it("rejects a message shorter than 10 characters", () => {
    const result = createCampaignSchema.safeParse({
      ...validUnofficial,
      message: "curta",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "A mensagem deve ter ao menos 10 caracteres.",
      );
    }
  });

  it("does NOT require the official-only fields (channel branch)", () => {
    // The unofficial shape has no waPhoneNumberId/templateId/contactIds, so a
    // message-only payload is valid — proving each channel is validated against
    // its own contract.
    const result = createCampaignSchema.safeParse(validUnofficial);
    expect(result.success).toBe(true);
  });
});

describe("campaignsQuerySchema", () => {
  it("applies defaults for an empty query", () => {
    const result = campaignsQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
      expect(result.data.period).toBe("30d");
    }
  });

  it("coerces string page/limit to numbers", () => {
    const result = campaignsQuerySchema.safeParse({ page: "3", limit: "50" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.limit).toBe(50);
    }
  });

  it("rejects a limit above 100", () => {
    expect(campaignsQuerySchema.safeParse({ limit: "150" }).success).toBe(false);
  });

  it("rejects an unknown apiType", () => {
    expect(campaignsQuerySchema.safeParse({ apiType: "SMS" }).success).toBe(
      false,
    );
  });
});
