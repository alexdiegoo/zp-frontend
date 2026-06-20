import { PatientDetailView } from "./view";

export const metadata = { title: "Paciente" };

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PatientDetailView patientId={id} />;
}
