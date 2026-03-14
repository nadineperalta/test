import { NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/supabase";
import { getLocalDateString } from "@/lib/dates";
import { getTodaySummary } from "@/lib/analytics";
import type { Habit } from "@/types/database";

export async function GET() {
  const supabase = createSupabaseClient();
  const today = getLocalDateString();

  const [habitsRes, completionsRes] = await Promise.all([
    supabase.from("habits").select("*").eq("is_archived", false),
    supabase.from("habit_completions").select("habit_id, completion_date").eq("completion_date", today),
  ]);

  const habits = (habitsRes.data ?? []) as Habit[];
  const completions = (completionsRes.data ?? []) as { habit_id: string; completion_date: string }[];

  return NextResponse.json(getTodaySummary(habits, completions));
}
