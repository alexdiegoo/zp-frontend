import { connectWhatsAppSchema } from "./integrations";

describe("connectWhatsAppSchema", () => {
  it("accepts a valid WhatsApp number", () => {
    expect(
      connectWhatsAppSchema.safeParse({ phoneNumber: "+55 (11) 99999-8888" })
        .success,
    ).toBe(true);
  });

  it("accepts a plain digit string within length bounds", () => {
    expect(
      connectWhatsAppSchema.safeParse({ phoneNumber: "5511999998888" }).success,
    ).toBe(true);
  });

  it("rejects a number that is too short", () => {
    const result = connectWhatsAppSchema.safeParse({ phoneNumber: "119999" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Informe um número de WhatsApp válido com DDI e DDD.",
      );
    }
  });

  it("rejects letters", () => {
    expect(
      connectWhatsAppSchema.safeParse({ phoneNumber: "not-a-number" }).success,
    ).toBe(false);
  });
});
