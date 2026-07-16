import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { TemplateDetailView } from "./view";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("templates");
  return { title: t("detail.metaTitle") };
}

export default async function TemplateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TemplateDetailView templateId={id} />;
}
