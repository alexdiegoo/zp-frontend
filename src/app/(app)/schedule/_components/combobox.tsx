"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronsUpDown, Loader2, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export type ComboboxOption = {
  value: string;
  label: string;
  /** Secondary line shown under the label (e.g. WhatsApp number, price). */
  hint?: string;
};

interface ComboboxProps {
  /** Currently selected value (empty string when none). */
  value: string;
  /** Label to display for the current selection while the field is collapsed. */
  selectedLabel?: string;
  options: ComboboxOption[];
  onSelect: (value: string, option: ComboboxOption) => void;
  onClear: () => void;
  /** Notifies the parent of the search term so it can fetch/filter. */
  onSearchChange: (query: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  emptyMessage?: string;
  /** Hint shown before the minimum search length is reached. */
  typeMoreMessage?: string;
  invalid?: boolean;
  disabled?: boolean;
  onBlur?: () => void;
}

/**
 * Minimal async combobox built from an `Input` + a positioned results list — the
 * project has no `command`/`popover` primitives. Collapsed it shows the selected
 * label with a clear button; focused it becomes a search field with a dropdown.
 */
export function Combobox({
  value,
  selectedLabel,
  options,
  onSelect,
  onClear,
  onSearchChange,
  isLoading,
  placeholder = "Buscar…",
  emptyMessage = "Nenhum resultado.",
  typeMoreMessage,
  invalid,
  disabled,
  onBlur,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  // Close + commit blur when focus leaves the whole widget (mouse or keyboard).
  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
        onBlur?.();
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, onBlur]);

  // Clamp during render rather than resetting in an effect — `activeIndex` is
  // reset to 0 whenever the query changes, and options only shrink between.
  const clampedIndex = Math.min(activeIndex, Math.max(0, options.length - 1));
  const activeOption = options[clampedIndex];

  function updateQuery(next: string) {
    setQuery(next);
    setActiveIndex(0);
    onSearchChange(next);
    if (!open) setOpen(true);
  }

  function commit(option: ComboboxOption) {
    onSelect(option.value, option);
    setQuery("");
    setOpen(false);
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((i) => Math.min(i + 1, options.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter") {
      if (open && activeOption) {
        event.preventDefault();
        commit(activeOption);
      }
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  // Collapsed selection chip.
  if (value && selectedLabel && !open) {
    return (
      <div ref={containerRef} className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            setOpen(true);
            onSearchChange("");
          }}
          className={cn(
            "flex h-8 w-full items-center justify-between gap-2 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
            invalid && "border-destructive ring-3 ring-destructive/20",
          )}
        >
          <span className="truncate text-left">{selectedLabel}</span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <X
              className="size-4 hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
            />
            <ChevronsUpDown className="size-4" />
          </span>
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <Input
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        autoComplete="off"
        value={query}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={invalid}
        onChange={(e) => updateQuery(e.target.value)}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
      />
      {open ? (
        <div
          id={listId}
          role="listbox"
          className="absolute z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 px-2 py-3 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Buscando…
            </div>
          ) : options.length === 0 ? (
            <div className="px-2 py-3 text-center text-sm text-muted-foreground">
              {typeMoreMessage ?? emptyMessage}
            </div>
          ) : (
            options.map((option, index) => (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={option.value === value}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => commit(option)}
                className={cn(
                  "flex w-full items-start justify-between gap-2 rounded-sm px-2 py-1.5 text-left text-sm",
                  index === clampedIndex
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground",
                )}
              >
                <span className="flex flex-col">
                  <span className="truncate">{option.label}</span>
                  {option.hint ? (
                    <span className="text-xs text-muted-foreground">
                      {option.hint}
                    </span>
                  ) : null}
                </span>
                {option.value === value ? (
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                ) : null}
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
