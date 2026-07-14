import Link from "next/link";

import { Logo } from "@/components/shared/layout/logo";

/** Public footer — wordmark and placeholder legal links. */
export function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-6 px-4 py-10 sm:flex-row sm:px-6">
        <div className="flex flex-col items-center gap-2 sm:items-start">
          <Logo size="md" />
          <p className="text-[13px] leading-[18px] text-muted-foreground">
            CRM e WhatsApp marketing para clínicas.
          </p>
        </div>

        <nav className="flex items-center gap-6 text-sm text-muted-foreground">
          <Link
            href="/privacidade"
            className="transition-colors hover:text-foreground"
          >
            Política de privacidade
          </Link>
          <Link href="/login" className="transition-colors hover:text-foreground">
            Entrar
          </Link>
        </nav>
      </div>

      <div className="border-t border-border/60">
        <p className="mx-auto w-full max-w-6xl px-4 py-5 text-center text-xs text-muted-foreground sm:px-6">
          © {year} ZapBlast. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
