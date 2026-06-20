import { Section, PageHeader } from "@/components/shared/layout/page-header";
import { Muted } from "@/components/ui/typography";

export const metadata = { title: "Templates" };

export default function TemplatesPage() {
  return (
    <Section>
      <PageHeader title="Templates" description="Modelos de mensagem aprovados e rascunhos." />
      <div className="flex min-h-64 items-center justify-center rounded-xl border border-dashed border-border bg-card">
        <Muted>Em construção.</Muted>
      </div>
    </Section>
  );
}
