import {
  CalendarCheck,
  DollarSign,
  TrendingUp,
  UserPlus,
} from "lucide-react";

import { Section, PageHeader } from "@/components/shared/layout/page-header";
import { H3, Muted } from "@/components/ui/typography";

export const metadata = { title: "Dashboard" };

const KPIS = [
  {
    label: "Novos leads",
    value: "1.284",
    hint: "+12,4% vs. período anterior",
    icon: UserPlus,
  },
  {
    label: "Agendamentos",
    value: "318",
    hint: "no funil",
    icon: CalendarCheck,
  },
  {
    label: "Taxa de conversão",
    value: "6,8%",
    hint: "lead → procedimento",
    icon: TrendingUp,
  },
  {
    label: "Receita",
    value: "R$ 161.240",
    hint: "atribuída a campanhas",
    icon: DollarSign,
  },
] as const;

export default function DashboardPage() {
  return (
    <Section>
      <PageHeader
        title="Dashboard"
        description="Visão geral da jornada do paciente e do desempenho das campanhas."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {KPIS.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="rounded-xl border border-border bg-card p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <Muted className="font-medium">{kpi.label}</Muted>
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-brand">
                  <Icon className="size-4" />
                </span>
              </div>
              <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                {kpi.value}
              </p>
              <Muted className="mt-1">{kpi.hint}</Muted>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
        <H3>Desempenho por estágio</H3>
        <Muted className="mt-1">
          Gráficos de funil e métricas por etapa aparecerão aqui.
        </Muted>
      </div>
    </Section>
  );
}
