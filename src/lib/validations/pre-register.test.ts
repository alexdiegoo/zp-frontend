import { preRegisterSchema } from "./pre-register";

describe("preRegisterSchema", () => {
  const valid = {
    name: "Ana Souza",
    clinicName: "Clínica Vida",
    email: "ana@clinica.com",
    whatsapp: "+5511999998888",
  };

  it("accepts a valid pre-registration", () => {
    expect(preRegisterSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects a missing name", () => {
    const result = preRegisterSchema.safeParse({ ...valid, name: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Informe seu nome.");
    }
  });

  it("rejects a malformed email", () => {
    const result = preRegisterSchema.safeParse({ ...valid, email: "nope" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Informe um e-mail válido.");
    }
  });

  it("rejects an invalid WhatsApp number", () => {
    const result = preRegisterSchema.safeParse({ ...valid, whatsapp: "123" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Informe um WhatsApp válido com DDD.",
      );
    }
  });
});
