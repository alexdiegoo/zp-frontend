"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SidebarNav } from "@/components/shared/layout/sidebar-nav";

/**
 * Mobile navigation drawer. Renders a hamburger trigger (meant for the top bar,
 * shown only below `lg`) that opens a left-side `Sheet` containing the shared
 * `SidebarNav`. Closes automatically on route change and when a nav link is
 * clicked. Above `lg` the persistent `Sidebar` is used instead.
 */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);

  // Close the drawer whenever the route changes (covers link clicks and any
  // programmatic navigation). Adjusting state during render — React's
  // recommended alternative to a state-syncing effect — so the closed drawer is
  // committed in the same pass as the new route.
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label="Abrir menu de navegação"
        className="flex size-11 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted lg:hidden"
      >
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent
        side="left"
        className="overflow-y-auto border-r-0 bg-sidebar p-0 text-sidebar-foreground data-[side=left]:w-[260px] data-[side=left]:sm:max-w-[260px]"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Navegação</SheetTitle>
          <SheetDescription>Menu principal do aplicativo</SheetDescription>
        </SheetHeader>
        <SidebarNav onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
