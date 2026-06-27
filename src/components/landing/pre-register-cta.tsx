"use client";

import { useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import {
  preRegisterSchema,
  type PreRegisterDto,
} from "@/lib/validations/pre-register";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Field = keyof PreRegisterDto;
type FormState = Record<Field, string>;
type FieldErrors = Partial<Record<Field, string>>;

const EMPTY_FORM: FormState = {
  name: "",
  clinicName: "",
  email: "",
  whatsapp: "",
};

const FIELDS: ReadonlyArray<{
  name: Field;
  label: string;
  type: string;
  placeholder: string;
  autoComplete: string;
  inputMode?: "email" | "tel" | "text";
}> = [
  {
    name: "name",
    label: "Seu nome",
    type: "text",
    placeholder: "Maria Silva",
    autoComplete: "name",
  },
  {
    name: "clinicName",
    label: "Nome da clínica",
    type: "text",
    placeholder: "Clínica Sorriso",
    autoComplete: "organization",
  },
  {
    name: "email",
    label: "E-mail",
    type: "email",
    placeholder: "voce@clinica.com",
    autoComplete: "email",
    inputMode: "email",
  },
  {
    name: "whatsapp",
    label: "WhatsApp",
    type: "tel",
    placeholder: "(11) 98888-7777",
    autoComplete: "tel",
    inputMode: "tel",
  },
];

/**
 * Inline waitlist capture. There is no backend — validation runs client-side
 * with the shared Zod schema and submission is simulated with a short delay.
 * Per spec this avoids a native <form>; submit is wired through a React handler.
 */
export function PreRegisterCta() {
  const [values, setValues] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field: Field, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
    // Clear the field's error as soon as the user edits it.
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  }

  function handleSubmit() {
    if (isSubmitting) return;

    const result = preRegisterSchema.safeParse(values);
    if (!result.success) {
      // Block the (simulated) request and surface the first error per field.
      const fieldErrors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as Field;
        if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    // Simulate a ~1s network round-trip — no real API call.
    setTimeout(() => {
      setIsSubmitting(false);
      setValues(EMPTY_FORM);
      toast.success("Você está na lista! Entraremos em contato em breve.");
    }, 1000);
  }

  return (
    <section id="pre-cadastro" className="scroll-mt-20">
      <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-brand px-6 py-14 text-brand-foreground sm:px-12">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -right-20 size-80 rounded-full bg-primary/30 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-28 -left-16 size-80 rounded-full bg-white/10 blur-3xl"
          />

          <div className="relative grid items-center gap-10 lg:grid-cols-2">
            {/* Pitch */}
            <div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Entre na lista de espera do ZapBlast
              </h2>
              <p className="mt-4 max-w-md text-base text-white/80">
                Deixe seus dados e seja uma das primeiras clínicas a organizar o
                funil de pacientes e disparar campanhas de WhatsApp em escala.
              </p>
              <p className="mt-6 flex items-center gap-2 text-sm text-white/70">
                <ShieldCheck className="size-4" />
                Sem compromisso. Usamos seus dados apenas para o convite.
              </p>
            </div>

            {/* Capture card */}
            <div className="rounded-2xl bg-card p-6 text-card-foreground shadow-xl sm:p-7">
              <div className="space-y-4">
                {FIELDS.map((field) => {
                  const error = errors[field.name];
                  const errorId = `${field.name}-error`;
                  return (
                    <div key={field.name} className="space-y-1.5">
                      <Label htmlFor={field.name}>{field.label}</Label>
                      <Input
                        id={field.name}
                        type={field.type}
                        inputMode={field.inputMode}
                        autoComplete={field.autoComplete}
                        placeholder={field.placeholder}
                        value={values[field.name]}
                        disabled={isSubmitting}
                        aria-invalid={Boolean(error)}
                        aria-describedby={error ? errorId : undefined}
                        onChange={(e) => updateField(field.name, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSubmit();
                        }}
                      />
                      <p
                        id={errorId}
                        className={cn(
                          "text-[13px] leading-[18px] text-destructive",
                          error ? "block" : "hidden"
                        )}
                      >
                        {error}
                      </p>
                    </div>
                  );
                })}

                <Button
                  type="button"
                  size="lg"
                  className="h-11 w-full text-base"
                  disabled={isSubmitting}
                  onClick={handleSubmit}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Enviando…
                    </>
                  ) : (
                    "Quero entrar na lista"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
