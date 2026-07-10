import {
  createAppointmentFormSchema,
  rescheduleFormSchema,
  updateAppointmentStatusSchema,
} from "./appointment";

const validForm = {
  type: "CONSULTATION" as const,
  patientId: "pat_1",
  procedureId: "proc_1",
  priceCharged: "",
  professionalId: "",
  durationMinutes: "30",
  notes: "",
  startAt: "2025-06-20T09:00:00.000Z",
};

describe("createAppointmentFormSchema", () => {
  it("accepts a valid consultation without a price", () => {
    expect(createAppointmentFormSchema.safeParse(validForm).success).toBe(true);
  });

  it("requires patient and procedure", () => {
    const result = createAppointmentFormSchema.safeParse({
      ...validForm,
      patientId: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Selecione o paciente.");
    }
  });

  it("requires a charged price only when the type is PROCEDURE (cross-field)", () => {
    const result = createAppointmentFormSchema.safeParse({
      ...validForm,
      type: "PROCEDURE",
      priceCharged: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find(
        (i) => i.path[0] === "priceCharged",
      );
      expect(issue?.message).toBe("Informe o valor cobrado.");
    }

    expect(
      createAppointmentFormSchema.safeParse({
        ...validForm,
        type: "PROCEDURE",
        priceCharged: "150,00",
      }).success,
    ).toBe(true);
  });

  it("rejects a duration outside 5–600 minutes", () => {
    expect(
      createAppointmentFormSchema.safeParse({ ...validForm, durationMinutes: "3" })
        .success,
    ).toBe(false);
    expect(
      createAppointmentFormSchema.safeParse({
        ...validForm,
        durationMinutes: "999",
      }).success,
    ).toBe(false);
  });

  it("rejects an unknown appointment type", () => {
    expect(
      createAppointmentFormSchema.safeParse({ ...validForm, type: "SURGERY" })
        .success,
    ).toBe(false);
  });
});

describe("updateAppointmentStatusSchema", () => {
  it("accepts a valid status transition", () => {
    expect(
      updateAppointmentStatusSchema.safeParse({ status: "DONE" }).success,
    ).toBe(true);
  });

  it("rejects a status outside the allowed actions", () => {
    expect(
      updateAppointmentStatusSchema.safeParse({ status: "SCHEDULED" }).success,
    ).toBe(false);
  });
});

describe("rescheduleFormSchema", () => {
  it("requires a new start date/time", () => {
    const result = rescheduleFormSchema.safeParse({
      startAt: "",
      durationMinutes: "30",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Informe a nova data e horário.",
      );
    }
  });
});
