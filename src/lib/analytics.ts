import type { Habit } from "@/types/database";
import type { CompletionRecord } from "./evaluation";
import { getHabitAdherence, addDays } from "./evaluation";
import { getLocalDateString } from "./dates";

export interface PeriodSummary {
  totalHabits: number;
  totalExpected: number;
  totalCompleted: number;
  totalMissed: number;
  overallRate: number;
  habits: {
    id: string;
    name: string;
    category: string;
    expected: number;
    completed: number;
    missed: number;
    rate: number;
  }[];
}

function buildSummary(
  habits: Habit[],
  completions: CompletionRecord[],
  startDate: string,
  endDate: string
): PeriodSummary {
  let totalExpected = 0;
  let totalCompleted = 0;

  const habitSummaries = habits.map((habit) => {
    const adherence = getHabitAdherence(habit, completions, startDate, endDate);
    totalExpected += adherence.expectedCount;
    totalCompleted += adherence.completedCount;

    return {
      id: habit.id,
      name: habit.name,
      category: habit.category,
      expected: adherence.expectedCount,
      completed: adherence.completedCount,
      missed: adherence.missedCount,
      rate: Math.round(adherence.adherenceRate * 100),
    };
  });

  return {
    totalHabits: habits.length,
    totalExpected,
    totalCompleted,
    totalMissed: totalExpected - totalCompleted,
    overallRate: totalExpected > 0 ? Math.round((totalCompleted / totalExpected) * 100) : 100,
    habits: habitSummaries,
  };
}

export function getTodaySummary(habits: Habit[], completions: CompletionRecord[]): PeriodSummary {
  const today = getLocalDateString();
  return buildSummary(habits, completions, today, today);
}

export function getWeekSummary(habits: Habit[], completions: CompletionRecord[]): PeriodSummary {
  const today = getLocalDateString();
  const weekAgo = addDays(today, -6);
  return buildSummary(habits, completions, weekAgo, today);
}

export function getMonthSummary(habits: Habit[], completions: CompletionRecord[]): PeriodSummary {
  const today = getLocalDateString();
  const monthAgo = addDays(today, -29);
  return buildSummary(habits, completions, monthAgo, today);
}
