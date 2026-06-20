import { ProcedureDetailView } from "./view";

export const metadata = { title: "Procedimento" };

export default async function ProcedureDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProcedureDetailView procedureId={id} />;
}
