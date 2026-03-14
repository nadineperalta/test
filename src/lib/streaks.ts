import type { Habit } from "@/types/database";
import { isDueOn } from "@/types/recurrence";
import { getLocalDateString } from "./dates";

/**
 * Calculate the current completion streak for each habit.
 * Walks backwards from today up to 90 days, counting consecutive
 * completions on days the habit was due.
 */
export function calculateStreaks(
  habits: Habit[],
  completions: { habit_id: string; completion_date: string }[],
  today: string
): Record<string, number> {
  const streaks: Record<string, number> = {};

  const byHabit: Record<string, Set<string>> = {};
  for (const c of completions) {
    if (!byHabit[c.habit_id]) byHabit[c.habit_id] = new Set();
    byHabit[c.habit_id].add(c.completion_date);
  }

  for (const habit of habits) {
    let streak = 0;
    const todayDate = new Date(today + "T12:00:00");

    if (isDueOn(habit.recurrence, todayDate)) {
      if (byHabit[habit.id]?.has(today)) {
        streak = 1;
      } else {
        streaks[habit.id] = 0;
        continue;
      }
    }

    for (let i = 1; i <= 90; i++) {
      const d = new Date(today + "T12:00:00");
      d.setDate(d.getDate() - i);
      const dateStr = getLocalDateString(d);

      if (isDueOn(habit.recurrence, d)) {
        if (byHabit[habit.id]?.has(dateStr)) {
          streak++;
        } else {
          break;
        }
      }
    }

    streaks[habit.id] = streak;
  }

  return streaks;
}
