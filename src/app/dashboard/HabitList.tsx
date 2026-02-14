"use client";

import { useState } from "react";
import type { Habit } from "@/types/database";
import { formatRecurrence } from "@/types/recurrence";

type CompleteHabitFn = (habitId: string) => Promise<{ error: string | null }>;

function recurrenceDisplay(habit: Habit): string {
  if (habit.recurrence) return formatRecurrence(habit.recurrence);
  return `${habit.frequency_per_week}x per week${habit.selected_days?.length ? ` · ${habit.selected_days.join(", ")}` : ""}`;
}

export function HabitList({
  habits,
  completedTodayIds,
  completeHabitToday,
}: {
  habits: Habit[];
  completedTodayIds: Set<string>;
  completeHabitToday: CompleteHabitFn;
}) {
  if (habits.length === 0) {
    return (
      <p className="text-gray-500 text-sm">No habits yet. Add one above.</p>
    );
  }

  return (
    <ul className="space-y-4">
      {habits.map((habit) => (
        <li
          key={habit.id}
          className="border rounded-lg p-4 flex flex-wrap items-center justify-between gap-3"
        >
          <div>
            <p className="font-medium">{habit.name}</p>
            <p className="text-sm text-gray-600">
              {habit.category} · {recurrenceDisplay(habit)}
            </p>
          </div>
          <CompleteButton
            habitId={habit.id}
            completed={completedTodayIds.has(habit.id)}
            completeHabitToday={completeHabitToday}
          />
        </li>
      ))}
    </ul>
  );
}

function CompleteButton({
  habitId,
  completed,
  completeHabitToday,
}: {
  habitId: string;
  completed: boolean;
  completeHabitToday: CompleteHabitFn;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (completed) return;
    setLoading(true);
    setError(null);
    const result = await completeHabitToday(habitId);
    setLoading(false);
    if (result.error) setError(result.error);
  }

  if (completed) {
    return (
      <span className="text-sm text-green-600 font-medium">Done today</span>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="bg-gray-800 text-white px-3 py-1.5 rounded text-sm font-medium disabled:opacity-50"
      >
        {loading ? "…" : "Complete today"}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}

