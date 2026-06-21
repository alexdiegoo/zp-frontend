import { EditTemplateView } from "./view";

export const metadata = { title: "Editar template" };

export default async function EditTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditTemplateView templateId={id} />;
}
