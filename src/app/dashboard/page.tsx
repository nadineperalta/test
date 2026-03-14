import { createSupabaseClient } from "@/lib/supabase";
import { getLocalDateString } from "@/lib/dates";
import { getHabitAdherence } from "@/lib/evaluation";
import type { CompletionRecord } from "@/lib/evaluation";
import type { Category, Habit } from "@/types/database";
import { isDueOn } from "@/types/recurrence";
import { buildCategoryColorMap } from "@/lib/category-colors";
import { calculateStreaks } from "@/lib/streaks";
import {
  createHabit,
  completeHabitToday,
  uncompleteHabitToday,
  createCategory,
  deleteHabit,
  updateHabit,
  deleteCategory,
  renameCategory,
} from "./actions";
import { HabitForm } from "./HabitForm";
import { HabitList } from "./HabitList";
import { CategoryManager } from "./CategoryManager";

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
      supabase.from("categories").select("id, name").order("name"),
      supabase
        .from("habit_completions")
        .select("habit_id, completion_date")
        .gte("completion_date", cutoffDate),
    ]);

  const habits: Habit[] = (habitsRes.data ?? []) as Habit[];
  const categories: Category[] = (categoriesRes.data ?? []) as Category[];
  const completedTodayIds = new Set(
    (completionsRes.data ?? []).map((c) => c.habit_id)
  );

  const dueTodayIds = new Set(
    habits.filter((h) => isDueOn(h.recurrence, today)).map((h) => h.id)
  );

  const recentCompletions = (recentCompletionsRes.data ?? []) as {
    habit_id: string;
    completion_date: string;
  }[];
  const streaks = calculateStreaks(habits, recentCompletions, today);

  const habitCountByCategory: Record<string, number> = {};
  for (const h of habits) {
    habitCountByCategory[h.category] =
      (habitCountByCategory[h.category] || 0) + 1;
  }

  const categoryColorMap = buildCategoryColorMap(
    categories.map((c) => c.name)
  );

  // Evaluation engine: 30-day adherence for each habit
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const evalStart = getLocalDateString(thirtyDaysAgo);
  const evaluationResults = habits.map((habit) => {
    const adherence = getHabitAdherence(
      habit,
      recentCompletions as CompletionRecord[],
      evalStart,
      today
    );
    return {
      name: habit.name,
      category: habit.category,
      expected: adherence.expectedCount,
      completed: adherence.completedCount,
      missed: adherence.missedCount,
      rate: Math.round(adherence.adherenceRate * 100),
    };
  });

  return (
    <main className="min-h-screen px-6 pb-16 max-w-3xl mx-auto">
      {/* Page header */}
      <header className="text-center pt-4 pb-10">
        <h1 className="text-3xl font-bold tracking-wider text-foreground">
          Habit Tracker
        </h1>
        <p className="mt-2 text-sm tracking-widest uppercase text-muted-foreground">
          Build better routines, one day at a time
        </p>
        <div className="mt-4 mx-auto w-12 h-0.5 bg-primary/40 rounded-full" />
      </header>

      {/* Add habit form */}
      <section className="mb-10">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
          New Habit
        </h2>
        <HabitForm
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

      {/* Habit grid */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
          Your Habits
        </h2>
        <HabitList
          habits={habits}
          completedTodayIds={completedTodayIds}
          dueTodayIds={dueTodayIds}
          streaks={streaks}
          categories={categories}
          categoryColorMap={categoryColorMap}
          completeHabitToday={completeHabitToday}
          uncompleteHabitToday={uncompleteHabitToday}
          deleteHabit={deleteHabit}
          updateHabit={updateHabit}
        />
      </section>

      {/* Evaluation debug — temporary verification output */}
      {habits.length > 0 && (
        <section className="mt-10">
          <details className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <summary className="px-5 py-3.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground cursor-pointer hover:bg-accent/50 transition-colors">
              Evaluation Engine (30-day adherence)
            </summary>
            <div className="px-5 pb-5 pt-2 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-2 pr-4 text-xs uppercase tracking-widest text-muted-foreground font-semibold">Habit</th>
                    <th className="pb-2 pr-4 text-xs uppercase tracking-widest text-muted-foreground font-semibold">Category</th>
                    <th className="pb-2 pr-4 text-xs uppercase tracking-widest text-muted-foreground font-semibold text-right">Expected</th>
                    <th className="pb-2 pr-4 text-xs uppercase tracking-widest text-muted-foreground font-semibold text-right">Done</th>
                    <th className="pb-2 pr-4 text-xs uppercase tracking-widest text-muted-foreground font-semibold text-right">Missed</th>
                    <th className="pb-2 text-xs uppercase tracking-widest text-muted-foreground font-semibold text-right">Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {evaluationResults.map((r, i) => (
                    <tr key={i} className="border-b border-border/50 last:border-0">
                      <td className="py-2 pr-4 font-medium">{r.name}</td>
                      <td className="py-2 pr-4">
                        <span className="inline-block px-2 py-0.5 text-[10px] uppercase tracking-widest font-semibold rounded-full border border-primary/25 bg-primary/10 text-primary">
                          {r.category}
                        </span>
                      </td>
                      <td className="py-2 pr-4 text-right tabular-nums">{r.expected}</td>
                      <td className="py-2 pr-4 text-right tabular-nums">{r.completed}</td>
                      <td className="py-2 pr-4 text-right tabular-nums">{r.missed}</td>
                      <td className="py-2 text-right tabular-nums font-semibold">
                        <span className={r.rate >= 80 ? "text-sage" : r.rate >= 50 ? "text-caramel" : "text-destructive"}>
                          {r.rate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </section>
      )}
    </main>
  );
}

