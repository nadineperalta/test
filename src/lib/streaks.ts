import type { Habit } from "@/types/database";
import { isDueOn } from "@/types/recurrence";
import { getLocalDateString } from "./dates";

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
}

/**
 * Calculate the current and longest completion streaks for each habit.
 * Walks backwards from today up to 90 days.
 */
export function calculateStreaks(
  habits: Habit[],
  completions: { habit_id: string; completion_date: string }[],
  today: string
): Record<string, StreakData> {
  const streaks: Record<string, StreakData> = {};

  const byHabit: Record<string, Set<string>> = {};
  for (const c of completions) {
    if (!byHabit[c.habit_id]) byHabit[c.habit_id] = new Set();
    byHabit[c.habit_id].add(c.completion_date);
  }

  for (const habit of habits) {
    let currentStreak = 0;
    let longestStreak = 0;
    let runningStreak = 0;
    let currentBroken = false;
    const todayDate = new Date(today + "T12:00:00");

    // Check today first for current streak
    if (isDueOn(habit.recurrence, todayDate)) {
      if (byHabit[habit.id]?.has(today)) {
        currentStreak = 1;
        runningStreak = 1;
      } else {
        currentBroken = true;
      }
    }

    for (let i = 1; i <= 90; i++) {
      const d = new Date(today + "T12:00:00");
      d.setDate(d.getDate() - i);
      const dateStr = getLocalDateString(d);

      if (isDueOn(habit.recurrence, d)) {
        if (byHabit[habit.id]?.has(dateStr)) {
          runningStreak++;
          if (!currentBroken) {
            currentStreak = runningStreak;
          }
        } else {
          longestStreak = Math.max(longestStreak, runningStreak);
          runningStreak = 0;
          currentBroken = true;
        }
      }
    }

    longestStreak = Math.max(longestStreak, runningStreak);
    longestStreak = Math.max(longestStreak, currentStreak);

    streaks[habit.id] = { currentStreak, longestStreak };
  }

  return streaks;
}
