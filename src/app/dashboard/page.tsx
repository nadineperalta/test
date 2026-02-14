import { createSupabaseClient } from "@/lib/supabase";
import type { Category, Habit } from "@/types/database";
import { createHabit, completeHabitToday, createCategory } from "./actions";
import { HabitForm } from "./HabitForm";
import { HabitList } from "./HabitList";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createSupabaseClient();
  const today = new Date().toISOString().slice(0, 10);

  const [habitsRes, completionsRes, categoriesRes] = await Promise.all([
    supabase.from("habits").select("*").order("created_at", { ascending: false }),
    supabase
      .from("habit_completions")
      .select("habit_id")
      .eq("completion_date", today),
    supabase.from("categories").select("id, name").order("name"),
  ]);

  const habits: Habit[] = (habitsRes.data ?? []) as Habit[];
  const categories: Category[] = (categoriesRes.data ?? []) as Category[];
  const completedTodayIds = new Set(
    (completionsRes.data ?? []).map((c) => c.habit_id)
  );

  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Habit Tracker</h1>

      <section className="mb-8">
        <h2 className="text-lg font-medium mb-3">Add habit</h2>
        <HabitForm
          categories={categories}
          createHabit={createHabit}
          createCategory={createCategory}
        />
      </section>

      <section>
        <h2 className="text-lg font-medium mb-3">Your habits</h2>
        <HabitList
          habits={habits}
          completedTodayIds={completedTodayIds}
          completeHabitToday={completeHabitToday}
        />
      </section>
    </main>
  );
}
