"use client";

import { Bell, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";

import { ClinicSwitcher } from "@/components/shared/clinic/clinic-switcher";
import { LocaleSwitcher } from "@/components/shared/i18n/locale-switcher";
import { MobileNav } from "@/components/shared/layout/mobile-nav";

/** Sticky top bar for the authenticated shell: mobile nav trigger + clinic switcher + notifications + user menu. */
export function Topbar() {
  const t = useTranslations("common");

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-2 border-b border-border bg-card px-4 lg:px-6">
      <div className="flex min-w-0 items-center gap-1">
        {/* Hamburger — only below lg; opens the navigation drawer. */}
        <MobileNav />
        <ClinicSwitcher />
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Language switcher — hidden on the smallest screens where it lives in
            the mobile nav drawer instead. */}
        <div className="hidden sm:block">
          <LocaleSwitcher />
        </div>

        <button
          type="button"
          aria-label={t("notifications")}
          className="relative flex size-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted"
        >
          <Bell className="size-5" />
          <span className="absolute top-2.5 right-3 size-2 rounded-full border-2 border-card bg-destructive" />
        </button>

        <div className="h-4 w-px bg-border" />

        <button
          type="button"
          className="group flex min-h-11 items-center gap-2 rounded-full"
          aria-label={t("userMenu")}
        >
          <span className="flex size-8 items-center justify-center rounded-full bg-brand text-xs font-semibold text-brand-foreground">
            ZB
          </span>
          <ChevronDown className="size-4 text-muted-foreground transition-colors group-hover:text-foreground" />
        </button>
      </div>
    </header>
  );
}
