"use client";

import { AlertCircle, Loader2 } from "lucide-react";

import { useClinics } from "@/hooks/queries/use-clinics";
import { Sidebar } from "@/components/shared/layout/sidebar";
import { Topbar } from "@/components/shared/layout/topbar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ClinicProvider } from "./clinic-provider";
import { NoClinicScreen } from "./no-clinic-screen";

/**
 * Gates the whole authenticated app on the user having at least one clinic.
 *
 * - Loading → full-screen spinner.
 * - Error → retryable alert.
 * - No clinics → the "cadastrar clínica" screen.
 * - Has clinics → the app shell (sidebar + top bar) wrapped in `ClinicProvider`,
 *   which picks the active clinic and re-scopes everything on switch.
 */
export function ClinicGate({ children }: { children: React.ReactNode }) {
  const { data: clinics, isLoading, isError, error, refetch } = useClinics();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle />
          <AlertTitle>Não foi possível carregar suas clínicas</AlertTitle>
          <AlertDescription className="flex flex-col items-start gap-3">
            {error instanceof Error
              ? error.message
              : "Tente novamente em instantes."}
            <Button
              size="sm"
              variant="outline"
              onClick={() => refetch()}
            >
              Tentar novamente
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!clinics || clinics.length === 0) {
    return <NoClinicScreen />;
  }

  return (
    <ClinicProvider clinics={clinics}>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className="flex min-h-screen flex-col lg:pl-[220px]">
          <Topbar />
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </ClinicProvider>
  );
}
