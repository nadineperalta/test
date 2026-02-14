"use client";

import { useState } from "react";

const CATEGORIES = [
  "Skincare",
  "Hygiene",
  "Diet",
  "Supplements",
  "Fitness",
  "Sleep",
] as const;

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

type CreateHabitFn = (formData: FormData) => Promise<{ error: string | null }>;

export function HabitForm({ createHabit }: { createHabit: CreateHabitFn }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
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
        <label htmlFor="frequency_per_week" className="block text-sm font-medium mb-1">
          Frequency per week
        </label>
        <input
          id="frequency_per_week"
          name="frequency_per_week"
          type="number"
          min={1}
          max={7}
          required
          defaultValue={1}
          className="w-full border rounded px-3 py-2 text-sm"
        />
      </div>
      <div>
        <span className="block text-sm font-medium mb-2">Selected days (optional)</span>
        <div className="flex flex-wrap gap-2">
          {WEEKDAYS.map((day) => (
            <label key={day} className="flex items-center gap-1 text-sm">
              <input type="checkbox" name="selected_days" value={day} />
              {day}
            </label>
          ))}
        </div>
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
