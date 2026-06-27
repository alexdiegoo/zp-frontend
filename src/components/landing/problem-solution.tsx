import { Check, X } from "lucide-react";

const PROBLEMS = [
  "Pacientes somem depois da primeira conversa e ninguém faz o follow-up.",
  "Acompanhamento manual em planilhas e no caderninho — leads esfriam.",
  "Zero visibilidade: você não sabe quantos leads viraram agendamento.",
  "Campanhas de WhatsApp feitas no improviso, sem template nem controle.",
] as const;

const SOLUTIONS = [
  "Funil de pacientes que mostra exatamente quem precisa de follow-up hoje.",
  "Lembretes e mensagens automáticas para reativar quem parou de responder.",
  "Dashboard com conversão por estágio, no-show e receita por procedimento.",
  "Disparos em massa com templates aprovados pela Meta e canal não oficial.",
] as const;

/** Side-by-side framing of the clinic's pain vs. what ZapBlast delivers. */
export function ProblemSolution() {
  return (
    <section className="border-t border-border/60 bg-muted/30">
      <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Sua clínica atende bem. O problema está no que acontece{" "}
            <span className="text-brand">antes e depois</span> da consulta.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            É aí que o faturamento escorre — e é exatamente o que o ZapBlast
            organiza para você.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {/* Problem column */}
          <div className="rounded-2xl border border-border bg-card p-8 ring-1 ring-foreground/5">
            <h3 className="text-lg font-semibold text-foreground">
              Como funciona hoje
            </h3>
            <ul className="mt-6 space-y-4">
              {PROBLEMS.map((problem) => (
                <li key={problem} className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                    <X className="size-3.5" />
                  </span>
                  <span className="text-sm text-muted-foreground">{problem}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Solution column */}
          <div className="rounded-2xl border border-brand/20 bg-brand/5 p-8 ring-1 ring-brand/10">
            <h3 className="text-lg font-semibold text-brand">Com o ZapBlast</h3>
            <ul className="mt-6 space-y-4">
              {SOLUTIONS.map((solution) => (
                <li key={solution} className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-brand">
                    <Check className="size-3.5" />
                  </span>
                  <span className="text-sm text-foreground">{solution}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
