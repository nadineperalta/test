"use client";

import { useState } from "react";
import type { Recurrence } from "@/types/recurrence";
import { RecurrencePicker } from "./RecurrencePicker";

const CATEGORIES = [
  "Skincare",
  "Hygiene",
  "Diet",
  "Supplements",
  "Fitness",
  "Sleep",
] as const;

const DEFAULT_RECURRENCE: Recurrence = { type: "weekly", days: [1, 2, 3, 4, 5], interval: 1 };

type CreateHabitFn = (formData: FormData) => Promise<{ error: string | null }>;

export function HabitForm({ createHabit }: { createHabit: CreateHabitFn }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [recurrence, setRecurrence] = useState<Recurrence>(DEFAULT_RECURRENCE);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("recurrence", JSON.stringify(recurrence));
    setError(null);
    setIsPending(true);
    const result = await createHabit(formData);
    setIsPending(false);
    if (result.error) setError(result.error);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 border p-4 rounded-lg"
    >
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Habit name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="w-full border rounded px-3 py-2 text-sm"
          placeholder="e.g. Morning walk"
        />
      </div>
      <div>
        <label htmlFor="category" className="block text-sm font-medium mb-1">
          Category
        </label>
        <select
          id="category"
          name="category"
          required
          className="w-full border rounded px-3 py-2 text-sm"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div>
        <span className="block text-sm font-medium mb-2">Repeat</span>
        <RecurrencePicker value={recurrence} onChange={setRecurrence} />
      </div>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="bg-black text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-50"
        >
          {isPending ? "Adding…" : "Add habit"}
        </button>
        {error && (
          <span className="text-sm text-red-600">{error}</span>
        )}
      </div>
    </form>
  );
}
