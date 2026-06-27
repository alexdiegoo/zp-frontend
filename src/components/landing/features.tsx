import {
  BarChart3,
  CalendarClock,
  KanbanSquare,
  Send,
  type LucideIcon,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const FEATURES: Feature[] = [
  {
    icon: Send,
    title: "Disparos em massa pelo WhatsApp",
    description:
      "Envie campanhas para milhares de pacientes com templates aprovados pela Meta (API oficial) ou pelo canal não oficial. Respeitando a janela de 24h e as regras de opt-in.",
  },
  {
    icon: KanbanSquare,
    title: "CRM de pacientes com funil Kanban",
    description:
      "Arraste cada lead pelos estágios — da captação ao procedimento. Nada se perde e a equipe sabe exatamente quem trabalhar primeiro.",
  },
  {
    icon: CalendarClock,
    title: "Agendamentos e lembretes automáticos",
    description:
      "Agende procedimentos e dispare lembretes automáticos no WhatsApp para reduzir faltas e manter a agenda cheia.",
  },
  {
    icon: BarChart3,
    title: "Dashboard de métricas de campanhas",
    description:
      "Acompanhe conversão por estágio, taxa de no-show, tempo até o agendamento e a performance de cada campanha em um só lugar.",
  },
];

/** The four core capabilities, one card each. */
export function Features() {
  return (
    <section id="recursos" className="scroll-mt-20">
      <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Tudo o que a clínica precisa, sem mais uma aba aberta
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Da primeira mensagem ao pós-procedimento — uma plataforma única para
            captar, converter e reter pacientes.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-brand">
                    <Icon className="size-5" />
                  </span>
                  <CardTitle className="mt-4 text-lg">{feature.title}</CardTitle>
                  <CardDescription className="mt-1.5 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent />
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
