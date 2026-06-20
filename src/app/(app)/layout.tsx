import { ClinicGate } from "@/components/shared/clinic/clinic-gate";

/**
 * Authenticated application shell. The whole app is gated on the user having a
 * clinic: `ClinicGate` resolves the clinic list and renders either the
 * "cadastrar clínica" screen or the sidebar + top bar shell around the content.
 */
export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ClinicGate>{children}</ClinicGate>;
}
