import { createClinicSchema } from "./clinic";

describe("createClinicSchema", () => {
  it("accepts a valid name + category", () => {
    expect(
      createClinicSchema.safeParse({
        name: "Clínica Vida",
        category: "Odontologia",
      }).success,
    ).toBe(true);
  });

  it("rejects a name shorter than 2 characters", () => {
    const result = createClinicSchema.safeParse({ name: "A", category: "Odonto" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "O nome da clínica deve ter ao menos 2 caracteres.",
      );
    }
  });

  it("rejects a missing category", () => {
    const result = createClinicSchema.safeParse({ name: "Clínica Vida", category: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Informe a área de atuação (ao menos 2 caracteres).",
      );
    }
  });
});
