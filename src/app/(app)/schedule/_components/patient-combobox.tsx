"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import { usePatientSearch } from "@/hooks/queries/use-patients";
import { useDebounce } from "@/hooks/ui/use-debounce";
import { Combobox, type ComboboxOption } from "./combobox";

interface PatientComboboxProps {
  value: string;
  onChange: (patientId: string) => void;
  invalid?: boolean;
  onBlur?: () => void;
}

/** Debounced patient search field (≥ 2 chars) backed by `GET /api/patients`. */
export function PatientCombobox({
  value,
  onChange,
  invalid,
  onBlur,
}: PatientComboboxProps) {
  const t = useTranslations("schedule");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<ComboboxOption>();
  const debounced = useDebounce(query, 300);

  const { data, isFetching } = usePatientSearch(debounced);

  // Derive the chip label from the current value, so an external form reset
  // (value → "") collapses the field back to search mode without an effect.
  const selectedLabel = value && selected?.value === value ? selected.label : undefined;

  const options = useMemo<ComboboxOption[]>(
    () =>
      (data?.data ?? []).map((patient) => ({
        value: patient.id,
        label: patient.name,
        hint: patient.whatsappNumber,
      })),
    [data],
  );

  const tooShort = debounced.trim().length < 2;

  return (
    <Combobox
      value={value}
      selectedLabel={selectedLabel}
      options={options}
      isLoading={isFetching && !tooShort}
      placeholder={t("patientSearch.placeholder")}
      typeMoreMessage={tooShort ? t("patientSearch.typeMore") : undefined}
      emptyMessage={t("patientSearch.empty")}
      invalid={invalid}
      onBlur={onBlur}
      onSearchChange={setQuery}
      onSelect={(id, option) => {
        setSelected(option);
        onChange(id);
      }}
      onClear={() => {
        setSelected(undefined);
        onChange("");
      }}
    />
  );
}
