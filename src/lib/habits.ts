import { createSupabaseClient } from "./supabase";
import { getLocalDateString } from "./dates";
import type { HabitInsert } from "@/types/database";
import type { Recurrence } from "@/types/recurrence";

export async function createHabit(data: {
  name: string;
  category: string;
  category_id: string;
  recurrence: Recurrence | null;
  xp_reward: number;
  time_of_day?: string | null;
  note?: string | null;
}) {
  const supabase = createSupabaseClient();
  if (!data.name.trim()) return { error: "Habit name is required" };

  const insert: HabitInsert = {
    name: data.name.trim(),
    category: data.category,
    category_id: data.category_id,
    frequency_per_week: 1,
    recurrence: data.recurrence ?? { type: "weekly", days: [1, 2, 3, 4, 5], interval: 1 },
    xp_reward: Math.min(100, Math.max(0, data.xp_reward)),
    time_of_day: data.time_of_day ?? null,
    note: data.note?.trim() || null,
  };

  const { error } = await supabase.from("habits").insert(insert as Record<string, unknown>);
  if (error) return { error: error.message };
  return { error: null };
}

export async function updateHabit(
  habitId: string,
  data: {
    name: string;
    category: string;
    category_id: string;
    recurrence: Recurrence | null;
    xp_reward: number;
    time_of_day?: string | null;
    note?: string | null;
  }
) {
  const supabase = createSupabaseClient();
  if (!data.name.trim()) return { error: "Habit name is required" };

  const { error } = await supabase
    .from("habits")
    .update({
      name: data.name.trim(),
      category: data.category,
      category_id: data.category_id,
      recurrence: data.recurrence,
      xp_reward: Math.min(100, Math.max(0, data.xp_reward)),
      time_of_day: data.time_of_day ?? null,
      note: data.note?.trim() || null,
    } as Record<string, unknown>)
    .eq("id", habitId);

  if (error) return { error: error.message };
  return { error: null };
}

export async function archiveHabit(habitId: string) {
  const supabase = createSupabaseClient();
  const { error } = await supabase
    .from("habits")
    .update({ is_archived: true } as Record<string, unknown>)
    .eq("id", habitId);
  if (error) return { error: error.message };
  return { error: null };
}

export async function unarchiveHabit(habitId: string) {
  const supabase = createSupabaseClient();
  const { error } = await supabase
    .from("habits")
    .update({ is_archived: false } as Record<string, unknown>)
    .eq("id", habitId);
  if (error) return { error: error.message };
  return { error: null };
}

export async function deleteHabit(habitId: string) {
  const supabase = createSupabaseClient();
  const { error } = await supabase.from("habits").delete().eq("id", habitId);
  if (error) return { error: error.message };
  return { error: null };
}

export async function completeHabit(habitId: string) {
  const supabase = createSupabaseClient();
  const today = getLocalDateString();
  const now = new Date().toISOString();

  const { data: existing } = await supabase
    .from("habit_completions")
    .select("id")
    .eq("habit_id", habitId)
    .eq("completion_date", today)
    .maybeSingle();

  if (existing) return { error: "Already completed today" };

  const { error } = await supabase.from("habit_completions").insert({
    habit_id: habitId,
    completion_date: today,
    completed_at: now,
  } as Record<string, unknown>);

  if (error) return { error: error.message };
  return { error: null };
}

export async function uncompleteHabit(habitId: string) {
  const supabase = createSupabaseClient();
  const today = getLocalDateString();

  const { error } = await supabase
    .from("habit_completions")
    .delete()
    .eq("habit_id", habitId)
    .eq("completion_date", today);

  if (error) return { error: error.message };
  return { error: null };
}
