"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  ChevronDown,
  ClipboardList,
  FileText,
  Filter,
  Headset,
  LayoutDashboard,
  type LucideIcon,
  Megaphone,
  MessageCircle,
  Settings,
  Users,
  Zap,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/layout/logo";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

type NavGroup = {
  label: string;
  icon: LucideIcon;
  items: NavItem[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Atendimento",
    icon: Headset,
    items: [
      { label: "Chat", href: "/chat", icon: MessageCircle },
      { label: "Funil", href: "/funnel", icon: Filter },
      { label: "Pacientes", href: "/patients", icon: Users },
      { label: "Procedimentos", href: "/procedures", icon: ClipboardList },
      { label: "Agenda", href: "/schedule", icon: Calendar },
    ],
  },
  {
    label: "Disparos WhatsApp",
    icon: Zap,
    items: [
      { label: "Campanhas", href: "/campaigns", icon: Megaphone },
      { label: "Templates", href: "/templates", icon: FileText },
    ],
  },
];

const DASHBOARD: NavItem = {
  label: "Dashboard",
  href: "/",
  icon: LayoutDashboard,
};

function useIsActive() {
  const pathname = usePathname();
  return (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] transition-colors",
        active
          ? "bg-sidebar-primary font-medium text-sidebar-primary-foreground"
          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      )}
    >
      <Icon className="size-5 shrink-0" />
      <span>{item.label}</span>
    </Link>
  );
}

function NavGroupBlock({
  group,
  isActive,
}: {
  group: NavGroup;
  isActive: (href: string) => boolean;
}) {
  const [open, setOpen] = useState(true);
  const GroupIcon = group.icon;

  return (
    <div className="mb-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-3 py-1 text-xs font-bold tracking-wider text-sidebar-foreground/40 uppercase transition-colors hover:text-sidebar-foreground/60"
      >
        <span className="flex items-center gap-1.5">
          <GroupIcon className="size-4" />
          {group.label}
        </span>
        <ChevronDown
          className={cn(
            "size-3.5 transition-transform",
            open ? "rotate-0" : "-rotate-90"
          )}
        />
      </button>
      {open ? (
        <div className="mt-1 space-y-0.5">
          {group.items.map((item) => (
            <NavLink key={item.href} item={item} active={isActive(item.href)} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function Sidebar() {
  const isActive = useIsActive();

  return (
    <aside className="fixed top-0 left-0 z-40 flex h-screen w-[220px] flex-col overflow-y-auto bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="mb-2 flex items-center px-4 py-6">
        <Logo size="sm" className="text-white" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2">
        <div className="mb-4 space-y-0.5">
          <NavLink item={DASHBOARD} active={isActive(DASHBOARD.href)} />
        </div>
        {NAV_GROUPS.map((group) => (
          <NavGroupBlock key={group.label} group={group} isActive={isActive} />
        ))}
      </nav>

      {/* Footer */}
      <div className="mt-auto space-y-1 border-t border-sidebar-border p-4">
        <NavLink
          item={{ label: "Configurações", href: "/settings", icon: Settings }}
          active={isActive("/settings")}
        />
        <div className="mt-4 rounded-xl bg-brand/20 p-2">
          <p className="mb-1 text-[11px] font-medium text-sidebar-primary">
            Seu plano: Pro
          </p>
          <button
            type="button"
            className="w-full rounded-lg bg-brand py-1 text-[11px] font-bold text-brand-foreground transition-opacity hover:opacity-90"
          >
            UPGRADE
          </button>
        </div>
      </div>
    </aside>
  );
}
