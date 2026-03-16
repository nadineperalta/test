import { createSupabaseClient } from "@/lib/supabase";
import { getLocalDateString } from "@/lib/dates";
import type { CompletionRecord } from "@/lib/evaluation";
import type { Category, Habit } from "@/types/database";
import { isDueOn } from "@/types/recurrence";
import { buildCategoryColorMap } from "@/lib/category-colors";
import { calculateStreaks } from "@/lib/streaks";
import {
  getTodaySummary,
  getWeekSummary,
  getMonthSummary,
  getQuarterSummary,
} from "@/lib/analytics";
import {
  createHabit,
  completeHabitToday,
  uncompleteHabitToday,
  createCategory,
  deleteHabit,
  updateHabit,
  deleteCategory,
  renameCategory,
  archiveHabit,
  unarchiveHabit,
} from "./actions";
import { HabitList } from "./HabitList";
import { CategoryManager } from "./CategoryManager";
import { AnalyticsSummary } from "./AnalyticsSummary";
import { AddHabitCard } from "./AddHabitCard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createSupabaseClient();
  const today = getLocalDateString();

  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const cutoffDate = getLocalDateString(ninetyDaysAgo);

  const [habitsRes, completionsRes, categoriesRes, recentCompletionsRes] =
    await Promise.all([
      supabase
        .from("habits")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("habit_completions")
        .select("habit_id")
        .eq("completion_date", today),
      supabase.from("categories").select("*").order("name"),
      supabase
        .from("habit_completions")
        .select("habit_id, completion_date")
        .gte("completion_date", cutoffDate),
    ]);

  const allHabits: Habit[] = (habitsRes.data ?? []) as Habit[];
  const categories: Category[] = (categoriesRes.data ?? []) as Category[];
  const completedTodayIds = new Set(
    (completionsRes.data ?? []).map((c) => c.habit_id)
  );

  // Active habits (not archived) for main display
  const habits = allHabits.filter((h) => !h.is_archived);
  const archivedHabits = allHabits.filter((h) => h.is_archived);

  const dueTodayIds = new Set(
    habits.filter((h) => isDueOn(h.recurrence, today)).map((h) => h.id)
  );

  const recentCompletions = (recentCompletionsRes.data ?? []) as {
    habit_id: string;
    completion_date: string;
  }[];
  const streaks = calculateStreaks(habits, recentCompletions, today);

  // Build category map by id for easy lookup
  const categoryMap: Record<string, Category> = {};
  for (const c of categories) {
    categoryMap[c.id] = c;
  }

  const habitCountByCategory: Record<string, number> = {};
  for (const h of allHabits) {
    habitCountByCategory[h.category] =
      (habitCountByCategory[h.category] || 0) + 1;
  }

  const categoryColorMap = buildCategoryColorMap(categories);

  // Compute analytics summaries
  const completionsForAnalytics = recentCompletions as CompletionRecord[];
  const todaySummary = getTodaySummary(habits, completionsForAnalytics);
  const weekSummary = getWeekSummary(habits, completionsForAnalytics);
  const monthSummary = getMonthSummary(habits, completionsForAnalytics);
  const quarterSummary = getQuarterSummary(habits, completionsForAnalytics);

  return (
    <main className="min-h-screen px-4 sm:px-6 pb-16 max-w-3xl mx-auto">
      {/* Page header */}
      <header className="text-center pt-3 pb-6 sm:pt-4 sm:pb-10">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-wider text-foreground">
          Habit Tracker
        </h1>
        <div className="mt-4 mx-auto w-12 h-0.5 bg-primary/40 rounded-full" />
      </header>

      {/* Analytics summary — primary view */}
      {habits.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            Overview
          </h2>
          <AnalyticsSummary
            today={todaySummary}
            week={weekSummary}
            month={monthSummary}
            quarter={quarterSummary}
          />
        </section>
      )}

      {/* Habit grid — grouped by category */}
      <section className="mb-10">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
          Your Habits
        </h2>
        <HabitList
          habits={habits}
          archivedHabits={archivedHabits}
          completedTodayIds={completedTodayIds}
          dueTodayIds={dueTodayIds}
          streaks={streaks}
          categories={categories}
          categoryColorMap={categoryColorMap}
          completeHabitToday={completeHabitToday}
          uncompleteHabitToday={uncompleteHabitToday}
          deleteHabit={deleteHabit}
          updateHabit={updateHabit}
          archiveHabit={archiveHabit}
          unarchiveHabit={unarchiveHabit}
        />
      </section>

      {/* Add new habit card + modal */}
      <section className="mb-10">
        <AddHabitCard
          categories={categories}
          createHabit={createHabit}
          createCategory={createCategory}
        />
      </section>

      {/* Category management */}
      <section className="mb-10">
        <CategoryManager
          categories={categories}
          habitCountByCategory={habitCountByCategory}
          deleteCategory={deleteCategory}
          renameCategory={renameCategory}
        />
      </section>
    </main>
  );
}
