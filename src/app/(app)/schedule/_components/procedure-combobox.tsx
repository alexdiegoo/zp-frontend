"use client";

import { useMemo, useState } from "react";

import { useProcedureSearch } from "@/hooks/queries/use-procedures";
import { useDebounce } from "@/hooks/ui/use-debounce";
import type { Procedure } from "@/types/api";
import { Combobox, type ComboboxOption } from "./combobox";

interface ProcedureComboboxProps {
  value: string;
  /** Receives the full procedure so the dialog can pre-fill the charged price. */
  onChange: (procedureId: string, procedure?: Procedure) => void;
  invalid?: boolean;
  onBlur?: () => void;
}

const priceFmt = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

/**
 * Debounced procedure search field backed by `GET /api/procedures`. Only active
 * procedures are offered (filtered client-side); selecting one surfaces its
 * `currentPrice` as a hint and to the parent for price pre-fill.
 */
export function ProcedureCombobox({
  value,
  onChange,
  invalid,
  onBlur,
}: ProcedureComboboxProps) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<{ value: string; label: string }>();
  const debounced = useDebounce(query, 300);

  const { data, isFetching } = useProcedureSearch(debounced);

  // Derive the chip label so an external form reset collapses the field with
  // no effect (see PatientCombobox for the same pattern).
  const selectedLabel =
    value && selected?.value === value ? selected.label : undefined;

  const active = useMemo(
    () => (data?.data ?? []).filter((p) => p.isActive),
    [data],
  );

  const options = useMemo<ComboboxOption[]>(
    () =>
      active.map((procedure) => ({
        value: procedure.id,
        label: procedure.name,
        hint:
          procedure.currentPrice != null
            ? priceFmt.format(procedure.currentPrice)
            : undefined,
      })),
    [active],
  );

  return (
    <Combobox
      value={value}
      selectedLabel={selectedLabel}
      options={options}
      isLoading={isFetching}
      placeholder="Buscar procedimento…"
      emptyMessage="Nenhum procedimento ativo encontrado."
      invalid={invalid}
      onBlur={onBlur}
      onSearchChange={setQuery}
      onSelect={(id, option) => {
        const procedure = active.find((p) => p.id === id);
        setSelected(option);
        onChange(id, procedure);
      }}
      onClear={() => {
        setSelected(undefined);
        onChange("");
      }}
    />
  );
}
