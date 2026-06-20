import { Section, PageHeader } from "@/components/shared/layout/page-header";
import { Muted } from "@/components/ui/typography";

export const metadata = { title: "Funil" };

export default function FunnelPage() {
  return (
    <Section>
      <PageHeader title="Funil" description="Acompanhe leads pelos estágios do pipeline." />
      <div className="flex min-h-64 items-center justify-center rounded-xl border border-dashed border-border bg-card">
        <Muted>Em construção.</Muted>
      </div>
    </Section>
  );
}
