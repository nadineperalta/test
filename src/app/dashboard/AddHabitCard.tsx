"use client";

import { useRef, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import type { Category } from "@/types/database";
import { HabitForm } from "./HabitForm";

type CreateHabitFn = (formData: FormData) => Promise<{ error: string | null }>;
type CreateCategoryFn = (formData: FormData) => Promise<{ error: string | null }>;

export function AddHabitCard({
  categories,
  createHabit,
  createCategory,
}: {
  categories: Category[];
  createHabit: CreateHabitFn;
  createCategory: CreateCategoryFn;
}) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (open) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-xl border border-dashed border-border bg-card/50 hover:bg-card hover:border-primary/30 hover:shadow-md transition-all p-5 flex flex-col gap-3 text-left cursor-pointer"
      >
        {/* Skeleton top row: fake icon + placeholder pills */}
        <div className="flex items-start justify-between gap-2 w-full">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0">
              <Plus className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <span className="h-3 w-16 rounded-full bg-muted" />
            <span className="h-4 w-10 rounded-full bg-muted" />
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            <span className="w-7 h-7 rounded-lg bg-muted" />
            <span className="w-7 h-7 rounded-lg bg-muted" />
          </div>
        </div>

        {/* Skeleton name + recurrence */}
        <div className="space-y-1.5">
          <span className="block h-4 w-32 rounded bg-muted" />
          <span className="block h-3 w-20 rounded bg-muted" />
        </div>

        {/* Skeleton completion button */}
        <div className="mt-auto pt-1">
          <div className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-primary/10 text-primary text-sm font-semibold tracking-wide">
            <Plus className="w-4 h-4" />
            Add new habit
          </div>
        </div>
      </button>

      <dialog
        ref={dialogRef}
        onClose={() => setOpen(false)}
        className="m-0 w-full h-full max-w-none max-h-none rounded-none border border-border bg-background p-0 shadow-xl backdrop:bg-black/50 backdrop:backdrop-blur-sm sm:m-auto sm:max-w-lg sm:h-auto sm:max-h-[85vh] sm:rounded-2xl"
      >
        <div className="flex flex-col h-full sm:h-auto">
          <div className="flex items-center justify-between px-4 sm:px-6 pt-5 pb-3 shrink-0">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              New Habit
            </h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-accent transition-colors text-muted-foreground"
              aria-label="Close"
            >
              <Plus className="w-5 h-5 rotate-45" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-6" style={{ paddingBottom: `max(1.5rem, env(safe-area-inset-bottom))` }}>
            <HabitForm
              categories={categories}
              createHabit={async (formData) => {
                const result = await createHabit(formData);
                if (!result.error) setOpen(false);
                return result;
              }}
              createCategory={createCategory}
            />
          </div>
        </div>
      </dialog>
    </>
  );
}
