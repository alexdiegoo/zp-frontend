import { Bell, ChevronDown } from "lucide-react";

/** Sticky top bar for the authenticated shell: notifications + user menu. */
export function Topbar() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-card px-6">
      <span className="text-base font-medium text-foreground">ZapBlast</span>

      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="Notificações"
          className="relative rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted"
        >
          <Bell className="size-5" />
          <span className="absolute top-2 right-2.5 size-2 rounded-full border-2 border-card bg-destructive" />
        </button>

        <div className="h-4 w-px bg-border" />

        <button
          type="button"
          className="group flex items-center gap-2 rounded-full"
          aria-label="Menu do usuário"
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
