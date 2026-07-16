import { BarChart3, CalendarClock, KanbanSquare, Send } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// `as const` keeps `key` a literal union so the `features.items.<key>.*`
// message lookups stay type-checked (FR-013).
const FEATURES = [
  { icon: Send, key: "whatsappBlast" },
  { icon: KanbanSquare, key: "crm" },
  { icon: CalendarClock, key: "scheduling" },
  { icon: BarChart3, key: "dashboard" },
] as const;

/** The four core capabilities, one card each. */
export async function Features() {
  const t = await getTranslations("public");

  return (
    <section id="recursos" className="scroll-mt-20">
      <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t("features.title")}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t("features.subtitle")}
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.key} className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-brand">
                    <Icon className="size-5" />
                  </span>
                  <CardTitle className="mt-4 text-lg">
                    {t(`features.items.${feature.key}.title`)}
                  </CardTitle>
                  <CardDescription className="mt-1.5 leading-relaxed">
                    {t(`features.items.${feature.key}.description`)}
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
