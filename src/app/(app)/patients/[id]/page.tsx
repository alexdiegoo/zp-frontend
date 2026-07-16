import { getTranslations } from "next-intl/server";

import { PatientDetailView } from "./view";

export async function generateMetadata() {
  const t = await getTranslations("nav");
  return { title: t("patients") };
}

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PatientDetailView patientId={id} />;
}
