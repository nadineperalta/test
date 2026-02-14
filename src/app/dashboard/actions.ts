"use server";

import { createSupabaseClient } from "@/lib/supabase";
import type { HabitInsert } from "@/types/database";
import { revalidatePath } from "next/cache";

export async function createHabit(formData: FormData) {
  const supabase = createSupabaseClient();
  const name = formData.get("name") as string;
  const category = formData.get("category") as string;
  const frequencyPerWeek = Number(formData.get("frequency_per_week"));
  const selectedDaysArr = formData.getAll("selected_days") as string[];
  const selectedDays =
    selectedDaysArr.length > 0 ? selectedDaysArr : null;

  const insert: HabitInsert = {
    name: name.trim(),
    category,
    frequency_per_week: frequencyPerWeek,
    selected_days: selectedDays,
  };

  const { error } = await supabase.from("habits").insert(insert as Record<string, unknown>);
  if (error) {
    return { error: error.message };
  }
  revalidatePath("/dashboard");
  return { error: null };
}

export async function completeHabitToday(habitId: string) {
  const supabase = createSupabaseClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: existing } = await supabase
    .from("habit_completions")
    .select("id")
    .eq("habit_id", habitId)
    .eq("completion_date", today)
    .maybeSingle();

  if (existing) {
    return { error: "Already completed today" };
  }

  const { error } = await supabase.from("habit_completions").insert({
    habit_id: habitId,
    completion_date: today,
  } as Record<string, unknown>);

  if (error) {
    return { error: error.message };
  }
  revalidatePath("/dashboard");
  return { error: null };
}
