"use client";

import { useState } from "react";
import { Building2, Plus } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
} from "@/components/ui/select";
import { useActiveClinic } from "./clinic-provider";
import { CreateClinicDialog } from "./create-clinic-dialog";

/** Special value used to trigger the "add clinic" flow from within the Select. */
const ADD_CLINIC = "__add_clinic__";

/**
 * Active-clinic dropdown shown in the top bar (replaces the static wordmark).
 * Choosing a clinic re-scopes every clinic-dependent menu and feature via the
 * provider, and the list ends with an action to create a new clinic.
 */
export function ClinicSwitcher() {
  const { clinics, activeClinic, switchClinic } = useActiveClinic();
  const [createOpen, setCreateOpen] = useState(false);

  function handleValueChange(value: string) {
    if (value === ADD_CLINIC) {
      setCreateOpen(true);
      return;
    }
    switchClinic(Number(value));
  }

  return (
    <>
      <Select value={String(activeClinic.id)} onValueChange={handleValueChange}>
        <SelectTrigger
          aria-label="Clínica ativa"
          className="h-9 min-w-0 gap-2 border-none bg-transparent px-2 font-medium shadow-none hover:bg-muted focus-visible:ring-0"
        >
          <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-brand">
            <Building2 className="size-4" />
          </span>
          {/* Render the name directly: Radix's SelectValue would mirror the
              item's two-line content into the compact trigger. `min-w-0` lets
              the name shrink so `truncate` adds the ellipsis and every header
              element stays visible down to 320px. */}
          <span className="min-w-0 truncate text-foreground">
            {activeClinic.name}
          </span>
        </SelectTrigger>
        <SelectContent className="min-w-56">
          {clinics.map((clinic) => (
            <SelectItem key={clinic.id} value={String(clinic.id)}>
              <span className="flex flex-col">
                <span className="font-medium">{clinic.name}</span>
                <span className="text-xs text-muted-foreground">
                  {clinic.category}
                </span>
              </span>
            </SelectItem>
          ))}
          <SelectSeparator />
          <SelectItem value={ADD_CLINIC} className="text-muted-foreground">
            <span className="flex items-center gap-2">
              <Plus className="size-4" />
              Cadastrar clínica
            </span>
          </SelectItem>
        </SelectContent>
      </Select>

      <CreateClinicDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(clinic) => switchClinic(clinic.id)}
      />
    </>
  );
}
