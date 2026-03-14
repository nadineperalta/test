import { createSupabaseClient } from "./supabase";
import type { Category } from "@/types/database";

export async function getCategories(): Promise<{ data: Category[]; error: string | null }> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name");
  if (error) return { data: [], error: error.message };
  return { data: (data ?? []) as Category[], error: null };
}

export async function createCategory(name: string) {
  const supabase = createSupabaseClient();
  if (!name.trim()) return { error: "Category name is required" };

  const { error } = await supabase
    .from("categories")
    .insert({ name: name.trim() } as Record<string, unknown>);

  if (error) {
    if (error.code === "23505") return { error: "That category already exists" };
    return { error: error.message };
  }
  return { error: null };
}

export async function deleteCategory(categoryId: string) {
  const supabase = createSupabaseClient();

  const { data: category } = await supabase
    .from("categories")
    .select("name, is_system")
    .eq("id", categoryId)
    .single();

  if (!category) return { error: "Category not found" };
  if (category.is_system) return { error: "Cannot delete a system category" };

  // Get the General category for reassignment
  const { data: general } = await supabase
    .from("categories")
    .select("id, name")
    .eq("name", "General")
    .single();

  if (!general) return { error: "General category not found" };

  // Reassign habits from this category to General
  await supabase
    .from("habits")
    .update({ category_id: general.id, category: general.name } as Record<string, unknown>)
    .eq("category_id", categoryId);

  const { error } = await supabase.from("categories").delete().eq("id", categoryId);
  if (error) return { error: error.message };
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
    if (catError.code === "23505") return { error: "A category with that name already exists" };
    return { error: catError.message };
  }

  // Update all habits that reference the old category name
  await supabase
    .from("habits")
    .update({ category: trimmedName } as Record<string, unknown>)
    .eq("category", oldName);

  return { error: null };
}
