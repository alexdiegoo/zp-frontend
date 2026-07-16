import { getTranslations } from "next-intl/server";

import { ProcedureDetailView } from "./view";

export async function generateMetadata() {
  const t = await getTranslations("nav");
  return { title: t("procedures") };
}

export default async function ProcedureDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProcedureDetailView procedureId={id} />;
}
