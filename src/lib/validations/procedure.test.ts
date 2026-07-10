import {
  cleanProcedurePayload,
  createProcedureSchema,
  proceduresQuerySchema,
} from "./procedure";

describe("createProcedureSchema", () => {
  it("accepts a valid procedure with a price string", () => {
    const result = createProcedureSchema.safeParse({
      name: "Limpeza de pele",
      description: "",
      basePrice: "150,00",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a name shorter than 2 characters", () => {
    const result = createProcedureSchema.safeParse({ name: "A" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Informe o nome do procedimento.",
      );
    }
  });

  it("rejects a malformed price", () => {
    const result = createProcedureSchema.safeParse({
      name: "Limpeza",
      basePrice: "abc",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Informe um valor válido (ex.: 150,00).",
      );
    }
  });

  it("accepts an empty-string price (optional)", () => {
    expect(
      createProcedureSchema.safeParse({ name: "Limpeza", basePrice: "" }).success,
    ).toBe(true);
  });
});

describe("cleanProcedurePayload", () => {
  it("coerces a comma-decimal price to a number and drops blanks", () => {
    const payload = cleanProcedurePayload({
      name: "  Limpeza  ",
      description: "   ",
      basePrice: "150,00",
    });
    expect(payload).toEqual({ name: "Limpeza", basePrice: 150 });
  });

  it("omits basePrice when the price string is blank", () => {
    const payload = cleanProcedurePayload({
      name: "Limpeza",
      description: "Facial",
      basePrice: "",
    });
    expect(payload).toEqual({ name: "Limpeza", description: "Facial" });
  });
});

describe("proceduresQuerySchema", () => {
  it("rejects a limit above 100", () => {
    expect(proceduresQuerySchema.safeParse({ limit: "500" }).success).toBe(false);
  });
});
