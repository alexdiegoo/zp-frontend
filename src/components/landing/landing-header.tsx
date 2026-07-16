import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { Logo } from "@/components/shared/layout/logo";
import { Button } from "@/components/ui/button";

/** Sticky top bar for the public landing — wordmark, login link and the primary CTA. */
export async function LandingHeader() {
  const t = await getTranslations("public");

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo size="md" />

        <nav className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/login"
            className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          >
            {t("nav.login")}
          </Link>
          <Button asChild size="lg">
            <a href="#pre-cadastro">{t("cta.joinWaitlist")}</a>
          </Button>
        </nav>
      </div>
    </header>
  );
}
