import { ArrowRight, CalendarCheck, MessageCircle, TrendingUp } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const PROOF_POINTS = [
  { icon: MessageCircle, labelKey: "hero.proofPoints.dispatch" },
  { icon: TrendingUp, labelKey: "hero.proofPoints.metrics" },
  { icon: CalendarCheck, labelKey: "hero.proofPoints.scheduling" },
] as const;

/** Top-of-funnel hero — headline, subheadline and the primary pre-register CTA. */
export async function Hero() {
  const t = await getTranslations("public");

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
          {t("hero.badge")}
        </Badge>

        <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl">
          {t.rich("hero.title", {
            highlight: (chunks) => <span className="text-brand">{chunks}</span>,
          })}
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
          {t("hero.subtitle")}
        </p>

        <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="h-11 px-6 text-base">
            <a href="#pre-cadastro">
              {t("cta.joinWaitlist")}
              <ArrowRight />
            </a>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-11 px-6 text-base">
            <a href="#recursos">{t("hero.ctaSecondary")}</a>
          </Button>
        </div>

        <ul className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          {PROOF_POINTS.map((point) => {
            const Icon = point.icon;
            return (
              <li
                key={point.labelKey}
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground"
              >
                <span className="flex size-7 items-center justify-center rounded-lg bg-secondary text-brand">
                  <Icon className="size-4" />
                </span>
                {t(point.labelKey)}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
