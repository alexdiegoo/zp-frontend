import { loginSchema, registerSchema } from "./auth";

describe("loginSchema", () => {
  it("accepts a valid email + password", () => {
    const result = loginSchema.safeParse({
      email: "ana@clinica.com",
      password: "senha1234",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a missing email", () => {
    const result = loginSchema.safeParse({ email: "", password: "senha1234" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Informe seu e-mail.");
    }
  });

  it("rejects a malformed email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "senha1234",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Informe um e-mail válido.");
    }
  });

  it("rejects a password shorter than 8 characters", () => {
    const result = loginSchema.safeParse({
      email: "ana@clinica.com",
      password: "curta",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "A senha deve ter ao menos 8 caracteres.",
      );
    }
  });
});

describe("registerSchema", () => {
  const valid = {
    name: "Ana Souza",
    email: "ana@clinica.com",
    password: "senha1234",
    confirmPassword: "senha1234",
  };

  it("accepts a valid registration", () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects a name shorter than 2 characters", () => {
    const result = registerSchema.safeParse({ ...valid, name: "A" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Informe seu nome completo.");
    }
  });

  it("attaches the mismatch error to confirmPassword (cross-field rule)", () => {
    const result = registerSchema.safeParse({
      ...valid,
      confirmPassword: "outra1234",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find(
        (i) => i.path[0] === "confirmPassword",
      );
      expect(issue?.message).toBe("As senhas não coincidem.");
    }
  });
});
