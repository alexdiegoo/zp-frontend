import { CalendarCheck, MessageCircle, TrendingUp } from "lucide-react";

import { Logo } from "@/components/shared/layout/logo";

const HIGHLIGHTS = [
  { icon: MessageCircle, text: "Disparos de WhatsApp em escala, oficial e não oficial." },
  { icon: TrendingUp, text: "Métricas de conversão em cada estágio do funil." },
  { icon: CalendarCheck, text: "Da captação do lead ao procedimento agendado." },
] as const;

/** Centered auth shell with a brand panel on large screens. */
export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel — hidden on small screens */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-brand p-10 text-brand-foreground lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-primary/30 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-16 size-96 rounded-full bg-primary/20 blur-3xl"
        />

        <Logo size="md" className="text-white" />

        <div className="relative space-y-6">
          <h2 className="max-w-sm text-3xl font-bold tracking-tight">
            O CRM que conduz o paciente do primeiro contato ao procedimento.
          </h2>
          <ul className="space-y-3">
            {HIGHLIGHTS.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.text} className="flex items-start gap-3 text-sm text-white/90">
                  <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-white/15">
                    <Icon className="size-4" />
                  </span>
                  {item.text}
                </li>
              );
            })}
          </ul>
        </div>

        <p className="relative text-xs text-white/60">
          © {new Date().getFullYear()} ZapBlast. Todos os direitos reservados.
        </p>
      </div>

      {/* Form column */}
      <div className="flex items-center justify-center bg-background p-4 sm:p-6">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
