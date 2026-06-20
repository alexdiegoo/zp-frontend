import { TemplateDetailView } from "./view";

export const metadata = { title: "Template" };

export default async function TemplateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TemplateDetailView templateId={id} />;
}
