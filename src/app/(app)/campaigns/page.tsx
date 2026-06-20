import { Section, PageHeader } from "@/components/shared/layout/page-header";
import { Muted } from "@/components/ui/typography";

export const metadata = { title: "Campanhas" };

export default function CampaignsPage() {
  return (
    <Section>
      <PageHeader title="Campanhas" description="Gerencie e acompanhe o desempenho de suas campanhas de WhatsApp." />
      <div className="flex min-h-64 items-center justify-center rounded-xl border border-dashed border-border bg-card">
        <Muted>Em construção.</Muted>
      </div>
    </Section>
  );
}
