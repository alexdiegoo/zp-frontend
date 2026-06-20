import { Section, PageHeader } from "@/components/shared/layout/page-header";
import { Muted } from "@/components/ui/typography";

export const metadata = { title: "Procedimentos" };

export default function ProceduresPage() {
  return (
    <Section>
      <PageHeader title="Procedimentos" description="Procedimentos agendados e executados." />
      <div className="flex min-h-64 items-center justify-center rounded-xl border border-dashed border-border bg-card">
        <Muted>Em construção.</Muted>
      </div>
    </Section>
  );
}
