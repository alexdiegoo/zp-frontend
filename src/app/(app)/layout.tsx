import { Sidebar } from "@/components/shared/layout/sidebar";
import { Topbar } from "@/components/shared/layout/topbar";

/** Authenticated application shell: fixed sidebar + top bar + content area. */
export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="flex min-h-screen flex-col pl-[220px]">
        <Topbar />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
