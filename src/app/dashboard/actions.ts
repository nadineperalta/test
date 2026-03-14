"use server";

import { revalidatePath } from "next/cache";
import type { Recurrence } from "@/types/recurrence";
import * as habitsLib from "@/lib/habits";
import * as categoriesLib from "@/lib/categories";

export async function createCategory(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  if (!name) return { error: "Category name is required" };
  const result = await categoriesLib.createCategory(name);
  if (!result.error) revalidatePath("/dashboard");
  return result;
}

export async function createHabit(formData: FormData) {
  const name = formData.get("name") as string;
  const category = formData.get("category") as string;
  const categoryId = formData.get("category_id") as string;
  const recurrenceRaw = formData.get("recurrence") as string | null;
  const timeOfDay = formData.get("time_of_day") as string | null;
  const note = formData.get("note") as string | null;

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

  const result = await habitsLib.createHabit({
    name,
    category,
    category_id: categoryId,
    recurrence,
    xp_reward,
    time_of_day: timeOfDay || null,
    note: note || null,
  });

  if (!result.error) revalidatePath("/dashboard");
  return result;
}

export async function completeHabitToday(habitId: string) {
  const result = await habitsLib.completeHabit(habitId);
  if (!result.error) revalidatePath("/dashboard");
  return result;
}

export async function uncompleteHabitToday(habitId: string) {
  const result = await habitsLib.uncompleteHabit(habitId);
  if (!result.error) revalidatePath("/dashboard");
  return result;
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
  const result = await habitsLib.updateHabit(habitId, data);
  if (!result.error) revalidatePath("/dashboard");
  return result;
}

export async function deleteHabit(habitId: string) {
  const result = await habitsLib.deleteHabit(habitId);
  if (!result.error) revalidatePath("/dashboard");
  return result;
}

export async function archiveHabit(habitId: string) {
  const result = await habitsLib.archiveHabit(habitId);
  if (!result.error) revalidatePath("/dashboard");
  return result;
}

export async function unarchiveHabit(habitId: string) {
  const result = await habitsLib.unarchiveHabit(habitId);
  if (!result.error) revalidatePath("/dashboard");
  return result;
}

export async function deleteCategory(categoryId: string) {
  const result = await categoriesLib.deleteCategory(categoryId);
  if (!result.error) revalidatePath("/dashboard");
  return result;
}

export async function renameCategory(categoryId: string, newName: string) {
  const result = await categoriesLib.renameCategory(categoryId, newName);
  if (!result.error) revalidatePath("/dashboard");
  return result;
}
