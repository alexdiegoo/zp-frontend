"use client";

import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface PatientSearchProps {
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
}

/** Text search by name or phone. Validation/debounce are owned by the parent. */
export function PatientSearch({ value, onChange, error }: PatientSearchProps) {
  const t = useTranslations("leads");
  return (
    <div className="w-full sm:max-w-xs">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t("search.placeholder")}
          aria-label={t("search.ariaLabel")}
          aria-invalid={Boolean(error)}
          className={cn("px-8", error && "border-destructive")}
        />
        {value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label={t("search.clear")}
            className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-0.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>
      {error ? (
        <p className="mt-1 text-[13px] text-destructive">{error}</p>
      ) : null}
    </div>
  );
}
