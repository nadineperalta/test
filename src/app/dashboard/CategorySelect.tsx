"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import type { Category } from "@/types/database";

export function CategorySelect({
  categories,
  value,
  onChange,
  disabled,
  id,
  name,
}: {
  categories: Category[];
  value: string;
  onChange: (categoryId: string, categoryName: string) => void;
  disabled?: boolean;
  id?: string;
  name?: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = categories.find((c) => c.id === value);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [open]);

  return (
    <div ref={containerRef} className="relative flex-1 min-w-[140px]">
      {/* Hidden inputs for form submission — both category name and id */}
      {name && (
        <>
          <input type="hidden" name={name} value={selected?.name ?? ""} />
          <input type="hidden" name="category_id" value={value} />
        </>
      )}

      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 border border-border bg-background rounded-lg pl-3 pr-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 disabled:opacity-50 transition-colors hover:bg-accent/30"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={selected ? "" : "text-muted-foreground"}>
          {selected?.name ?? "Select category"}
        </span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && categories.length > 0 && (
        <ul
          role="listbox"
          className="absolute z-50 mt-1.5 w-full max-h-56 overflow-auto rounded-xl border border-border bg-card shadow-lg py-1.5"
        >
          {categories.map((c) => {
            const isSelected = c.id === value;
            return (
              <li
                key={c.id}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(c.id, c.name);
                  setOpen(false);
                }}
                className={`flex items-center justify-between gap-2 px-3 py-2 text-sm cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-foreground hover:bg-accent/50"
                }`}
              >
                <span>{c.name}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
