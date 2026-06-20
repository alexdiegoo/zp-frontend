"use client";

import { useState } from "react";
import { Building2, Plus } from "lucide-react";

import { Logo } from "@/components/shared/layout/logo";
import { Button } from "@/components/ui/button";
import { H2, Muted } from "@/components/ui/typography";
import { CreateClinicDialog } from "./create-clinic-dialog";

/**
 * Shown when the authenticated user has no clinic yet. Nothing in the app works
 * without a tenant, so this takes over the whole screen until one is created —
 * creating it (via the dialog) makes it active and reveals the app shell.
 */
export function NoClinicScreen() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-14 items-center border-b border-border px-6">
        <Logo size="sm" />
      </header>

      <main className="flex flex-1 items-center justify-center p-6">
        <div className="flex max-w-md flex-col items-center text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-brand">
            <Building2 className="size-7" />
          </span>
          <H2 className="mt-5">Nenhuma clínica cadastrada</H2>
          <Muted className="mt-2">
            Cadastre a sua
            primeira clínica para começar a gerenciar pacientes, agenda e
            campanhas de WhatsApp.
          </Muted>
          <Button className="mt-6" onClick={() => setOpen(true)}>
            <Plus />
            Cadastrar clínica
          </Button>
        </div>
      </main>

      <CreateClinicDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
