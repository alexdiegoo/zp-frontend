import { SidebarNav } from "@/components/shared/layout/sidebar-nav";

/**
 * Persistent desktop sidebar. Hidden below `lg` (1024px) — on smaller screens
 * navigation is served by the `MobileNav` drawer in the top bar. The nav body
 * is shared via `SidebarNav` so both surfaces stay in sync.
 */
export function Sidebar() {
  return (
    <aside className="fixed top-0 left-0 z-40 hidden h-screen w-[220px] flex-col overflow-y-auto bg-sidebar text-sidebar-foreground lg:flex">
      <SidebarNav />
    </aside>
  );
}
