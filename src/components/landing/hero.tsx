import { ArrowRight, CalendarCheck, MessageCircle, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const PROOF_POINTS = [
  { icon: MessageCircle, label: "Disparos em escala" },
  { icon: TrendingUp, label: "Métricas por estágio" },
  { icon: CalendarCheck, label: "Agendamentos automáticos" },
] as const;

/** Top-of-funnel hero — headline, subheadline and the primary pre-register CTA. */
export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Soft brand glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -right-24 size-[28rem] rounded-full bg-primary/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-32 size-[28rem] rounded-full bg-brand/10 blur-3xl"
      />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center px-4 py-20 text-center sm:px-6 sm:py-28">
        <Badge variant="secondary" className="mb-6 text-brand">
          Lista de espera aberta · Vagas limitadas
        </Badge>

        <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl">
          Pare de perder pacientes entre uma{" "}
          <span className="text-brand">conversa e outra</span> no WhatsApp.
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
          O ZapBlast une CRM, funil de pacientes e disparos de WhatsApp em escala
          em uma só plataforma — feito para clínicas de estética, saúde e
          odontologia que querem crescer com previsibilidade.
        </p>

        <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="h-11 px-6 text-base">
            <a href="#pre-cadastro">
              Quero entrar na lista
              <ArrowRight />
            </a>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-11 px-6 text-base">
            <a href="#recursos">Ver recursos</a>
          </Button>
        </div>

        <ul className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          {PROOF_POINTS.map((point) => {
            const Icon = point.icon;
            return (
              <li
                key={point.label}
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground"
              >
                <span className="flex size-7 items-center justify-center rounded-lg bg-secondary text-brand">
                  <Icon className="size-4" />
                </span>
                {point.label}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
