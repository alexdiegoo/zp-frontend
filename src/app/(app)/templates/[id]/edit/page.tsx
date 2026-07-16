import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { EditTemplateView } from "./view";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("templates");
  return { title: t("edit.title") };
}

export default async function EditTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditTemplateView templateId={id} />;
}
