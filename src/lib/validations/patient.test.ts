import {
  cleanPatientPayload,
  createPatientSchema,
  patientsQuerySchema,
  type CreatePatientDto,
} from "./patient";

describe("createPatientSchema", () => {
  const valid: CreatePatientDto = {
    name: "Ana Souza",
    whatsappNumber: "+55 (11) 99999-8888",
    email: "",
    birthDate: "",
    address: "",
    acquisitionSource: "",
  };

  it("accepts a valid patient with blank optionals", () => {
    expect(createPatientSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects a name shorter than 2 characters", () => {
    const result = createPatientSchema.safeParse({ ...valid, name: "A" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Informe o nome do paciente.");
    }
  });

  it("rejects an invalid WhatsApp number", () => {
    const result = createPatientSchema.safeParse({
      ...valid,
      whatsappNumber: "abc",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Informe um número de WhatsApp válido com DDD.",
      );
    }
  });

  it("accepts an empty-string email but rejects a malformed one", () => {
    expect(createPatientSchema.safeParse({ ...valid, email: "" }).success).toBe(
      true,
    );
    const bad = createPatientSchema.safeParse({ ...valid, email: "nope" });
    expect(bad.success).toBe(false);
    if (!bad.success) {
      expect(bad.error.issues[0].message).toBe("Informe um e-mail válido.");
    }
  });
});

describe("cleanPatientPayload", () => {
  it("drops empty/whitespace-only optional fields and trims values", () => {
    const cleaned = cleanPatientPayload({
      name: "  Ana Souza  ",
      whatsappNumber: "  5511999998888  ",
      email: "",
      birthDate: "   ",
      address: "Rua X, 10",
      acquisitionSource: "",
    });
    expect(cleaned).toEqual({
      name: "Ana Souza",
      whatsappNumber: "5511999998888",
      address: "Rua X, 10",
    });
  });
});

describe("patientsQuerySchema", () => {
  it("defaults page/limit and coerces strings", () => {
    const result = patientsQuerySchema.safeParse({ page: "2" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(20);
    }
  });
});
