"use client";

import { Search, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface ProcedureSearchProps {
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
}

/** Text search by procedure name. Validation/debounce are owned by the parent. */
export function ProcedureSearch({
  value,
  onChange,
  error,
}: ProcedureSearchProps) {
  return (
    <div className="w-full sm:max-w-xs">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Buscar por nome…"
          aria-label="Buscar procedimentos"
          aria-invalid={Boolean(error)}
          className={cn("px-8", error && "border-destructive")}
        />
        {value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Limpar busca"
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
