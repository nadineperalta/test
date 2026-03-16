"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import type { ActionResult } from "@/types/actions";

export function CompletionToggle({
  habitId,
  completed,
  completeHabitToday,
  uncompleteHabitToday,
}: {
  habitId: string;
  completed: boolean;
  completeHabitToday: (id: string) => ActionResult;
  uncompleteHabitToday: (id: string) => ActionResult;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleToggle() {
    setLoading(true);
    setError(null);
    const result = completed
      ? await uncompleteHabitToday(habitId)
      : await completeHabitToday(habitId);
    setLoading(false);
    if (result.error) setError(result.error);
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={handleToggle}
        disabled={loading}
        className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-full text-sm font-semibold tracking-wide transition-shadow disabled:opacity-50 ${
          completed
            ? "bg-sage/15 text-sage border border-sage/30 hover:bg-sage/25 dark:bg-sage/20 dark:text-sage-light dark:border-sage/40"
            : "bg-primary text-primary-foreground shadow-sm hover:shadow-md"
        }`}
        aria-label={completed ? "Mark as incomplete" : "Mark as complete"}
      >
        {loading ? (
          "..."
        ) : completed ? (
          <>
            <Check className="w-4 h-4" />
            Done
          </>
        ) : (
          "Complete"
        )}
      </button>
      {error && (
        <span className="text-[11px] text-destructive text-center">
          {error}
        </span>
      )}
    </div>
  );
}
