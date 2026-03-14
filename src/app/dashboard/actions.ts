"use server";

import { createSupabaseClient } from "@/lib/supabase";
import { getLocalDateString } from "@/lib/dates";
import type { HabitInsert } from "@/types/database";
import type { Recurrence } from "@/types/recurrence";
import { revalidatePath } from "next/cache";

export async function createCategory(formData: FormData) {
  const supabase = createSupabaseClient();
  const name = (formData.get("name") as string)?.trim();
  if (!name) return { error: "Category name is required" };
  const { error } = await supabase
    .from("categories")
    .insert({ name } as Record<string, unknown>);
  if (error) {
    if (error.code === "23505") return { error: "That category already exists" };
    return { error: error.message };
  }
  revalidatePath("/dashboard");
  return { error: null };
}

export async function createHabit(formData: FormData) {
  const supabase = createSupabaseClient();
  const name = formData.get("name") as string;
  const category = formData.get("category") as string;
  const recurrenceRaw = formData.get("recurrence") as string | null;
  let recurrence: Recurrence | null = null;
  if (recurrenceRaw) {
    try {
      recurrence = JSON.parse(recurrenceRaw) as Recurrence;
    } catch {
      recurrence = { type: "weekly", days: [1, 2, 3, 4, 5], interval: 1 };
    }
  }

  const xpRaw = formData.get("xp_reward") as string | null;
  const xp_reward = xpRaw ? Math.min(100, Math.max(0, parseInt(xpRaw, 10) || 20)) : 20;

  const insert: HabitInsert = {
    name: name.trim(),
    category,
    frequency_per_week: 1,
    recurrence,
    xp_reward,
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
  const today = getLocalDateString();

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

export async function uncompleteHabitToday(habitId: string) {
  const supabase = createSupabaseClient();
  const today = getLocalDateString();

  const { error } = await supabase
    .from("habit_completions")
    .delete()
    .eq("habit_id", habitId)
    .eq("completion_date", today);

  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  return { error: null };
}

export async function updateHabit(
  habitId: string,
  data: { name: string; category: string; recurrence: Recurrence | null; xp_reward: number }
) {
  const supabase = createSupabaseClient();
  if (!data.name.trim()) return { error: "Habit name is required" };

  const { error } = await supabase
    .from("habits")
    .update({
      name: data.name.trim(),
      category: data.category,
      recurrence: data.recurrence,
      xp_reward: Math.min(100, Math.max(0, data.xp_reward)),
    } as Record<string, unknown>)
    .eq("id", habitId);

  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  return { error: null };
}

export async function deleteHabit(habitId: string) {
  const supabase = createSupabaseClient();
  const { error } = await supabase.from("habits").delete().eq("id", habitId);
  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  return { error: null };
}

export async function deleteCategory(categoryId: string) {
  const supabase = createSupabaseClient();

  const { data: category } = await supabase
    .from("categories")
    .select("name")
    .eq("id", categoryId)
    .single();

  if (!category) return { error: "Category not found" };

  const { count } = await supabase
    .from("habits")
    .select("id", { count: "exact", head: true })
    .eq("category", category.name);

  if (count && count > 0) {
    return { error: `Cannot delete: ${count} habit(s) still use this category` };
  }

  const { error } = await supabase.from("categories").delete().eq("id", categoryId);
  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  return { error: null };
}

export async function renameCategory(categoryId: string, newName: string) {
  const supabase = createSupabaseClient();
  if (!newName.trim()) return { error: "Category name is required" };

  const { data: category } = await supabase
    .from("categories")
    .select("name")
    .eq("id", categoryId)
    .single();

  if (!category) return { error: "Category not found" };

  const oldName = category.name;
  const trimmedName = newName.trim();

  const { error: catError } = await supabase
    .from("categories")
    .update({ name: trimmedName })
    .eq("id", categoryId);

  if (catError) {
    if (catError.code === "23505")
      return { error: "A category with that name already exists" };
    return { error: catError.message };
  }

  // Update all habits that reference the old category name
  await supabase
    .from("habits")
    .update({ category: trimmedName } as Record<string, unknown>)
    .eq("category", oldName);

  revalidatePath("/dashboard");
  return { error: null };
}
