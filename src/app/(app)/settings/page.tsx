import { Section, PageHeader } from "@/components/shared/layout/page-header";
import { Muted } from "@/components/ui/typography";

export const metadata = { title: "Configurações" };

export default function SettingsPage() {
  return (
    <Section>
      <PageHeader title="Configurações" description="Preferências da conta e da clínica." />
      <div className="flex min-h-64 items-center justify-center rounded-xl border border-dashed border-border bg-card">
        <Muted>Em construção.</Muted>
      </div>
    </Section>
  );
}
