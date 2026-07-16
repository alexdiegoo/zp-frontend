import type { ReactNode } from "react";

import { getTranslations } from "next-intl/server";

import { LandingHeader } from "@/components/landing/landing-header";
import { LandingFooter } from "@/components/landing/landing-footer";

import { PolicySection } from "./_components/policy-section";
import { POLICY_METADATA } from "./_content";

/**
 * Public privacy policy page.
 *
 * Server Component (no "use client"): 100% static legal copy with no interactivity,
 * so the full text is present in the server-rendered HTML — reachable by an anonymous
 * visitor or an automated crawler (e.g. a Meta app reviewer). Reuses the public
 * landing chrome for consistent navigation and branding.
 */
export async function PrivacyPolicyView() {
  const { controller, contactChannel, effectiveDate, dataDeletion } = POLICY_METADATA;
  const t = await getTranslations("public");

  const strong = (chunks: ReactNode) => (
    <span className="font-medium text-foreground">{chunks}</span>
  );

  return (
    <>
      <LandingHeader />

      <main className="flex-1">
        <article className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
          <header>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              {t("privacy.title")}
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              {t("privacy.lastUpdated", { date: effectiveDate })}
            </p>
          </header>

          <div className="mt-12 space-y-12">
            <PolicySection id="introducao" title={t("privacy.sections.intro.title")}>
              <p>{t("privacy.sections.intro.body.p1", { controller })}</p>
              <p>{t("privacy.sections.intro.body.p2")}</p>
            </PolicySection>

            <PolicySection
              id="dados-coletados"
              title={t("privacy.sections.dataCollected.title")}
            >
              <p>{t("privacy.sections.dataCollected.intro")}</p>
              <ul className="list-disc space-y-2 pl-5">
                <li>{t.rich("privacy.sections.dataCollected.items.identity", { strong })}</li>
                <li>{t.rich("privacy.sections.dataCollected.items.account", { strong })}</li>
                <li>{t.rich("privacy.sections.dataCollected.items.journey", { strong })}</li>
                <li>{t.rich("privacy.sections.dataCollected.items.campaigns", { strong })}</li>
              </ul>
            </PolicySection>

            <PolicySection id="uso-dos-dados" title={t("privacy.sections.dataUse.title")}>
              <p>{t("privacy.sections.dataUse.intro")}</p>
              <ul className="list-disc space-y-2 pl-5">
                <li>{t("privacy.sections.dataUse.items.crm")}</li>
                <li>
                  {t.rich("privacy.sections.dataUse.items.dispatch", {
                    em: (chunks) => <em>{chunks}</em>,
                  })}
                </li>
                <li>{t("privacy.sections.dataUse.items.metrics")}</li>
                <li>{t("privacy.sections.dataUse.items.support")}</li>
              </ul>
            </PolicySection>

            <PolicySection
              id="compartilhamento"
              title={t("privacy.sections.sharing.title")}
            >
              <p>{t("privacy.sections.sharing.intro")}</p>
              <ul className="list-disc space-y-2 pl-5">
                <li>{t.rich("privacy.sections.sharing.items.meta", { strong })}</li>
                <li>{t.rich("privacy.sections.sharing.items.infra", { strong })}</li>
                <li>{t.rich("privacy.sections.sharing.items.authorities", { strong })}</li>
              </ul>
            </PolicySection>

            <PolicySection id="retencao" title={t("privacy.sections.retention.title")}>
              <p>{t("privacy.sections.retention.body")}</p>
            </PolicySection>

            <PolicySection id="seus-direitos" title={t("privacy.sections.rights.title")}>
              <p>{t("privacy.sections.rights.intro")}</p>
              <ul className="list-disc space-y-2 pl-5">
                <li>{t.rich("privacy.sections.rights.items.access", { strong })}</li>
                <li>{t.rich("privacy.sections.rights.items.correction", { strong })}</li>
                <li>{t.rich("privacy.sections.rights.items.deletion", { strong })}</li>
                <li>{t.rich("privacy.sections.rights.items.portability", { strong })}</li>
                <li>{t.rich("privacy.sections.rights.items.revocation", { strong })}</li>
              </ul>
            </PolicySection>

            <PolicySection id="exclusao-de-dados" title={t("privacy.sections.deletion.title")}>
              <p>{t("privacy.sections.deletion.intro")}</p>
              <ol className="list-decimal space-y-2 pl-5">
                <li>
                  {t.rich("privacy.sections.deletion.steps.send", {
                    channel: dataDeletion.channel,
                    link: (chunks) => (
                      <a
                        href={`mailto:${dataDeletion.channel}`}
                        className="font-medium text-brand underline underline-offset-4 transition-colors hover:text-foreground"
                      >
                        {chunks}
                      </a>
                    ),
                  })}
                </li>
                <li>{t("privacy.sections.deletion.steps.identify")}</li>
                <li>
                  {t("privacy.sections.deletion.steps.confirm", {
                    timeframe: dataDeletion.timeframe,
                  })}
                </li>
              </ol>
            </PolicySection>

            <PolicySection
              id="controlador-e-contato"
              title={t("privacy.sections.controller.title")}
            >
              <p>
                {t.rich("privacy.sections.controller.body", {
                  controller,
                  email: contactChannel,
                  link: (chunks) => (
                    <a
                      href={`mailto:${contactChannel}`}
                      className="font-medium text-brand underline underline-offset-4 transition-colors hover:text-foreground"
                    >
                      {chunks}
                    </a>
                  ),
                })}
              </p>
            </PolicySection>
          </div>
        </article>
      </main>

      <LandingFooter />
    </>
  );
}
