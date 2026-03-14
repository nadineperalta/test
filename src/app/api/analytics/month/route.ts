import { NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/supabase";
import { getLocalDateString } from "@/lib/dates";
import { getMonthSummary } from "@/lib/analytics";
import type { Habit } from "@/types/database";

export async function GET() {
  const supabase = createSupabaseClient();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  const cutoff = getLocalDateString(thirtyDaysAgo);

  const [habitsRes, completionsRes] = await Promise.all([
    supabase.from("habits").select("*").eq("is_archived", false),
    supabase.from("habit_completions").select("habit_id, completion_date").gte("completion_date", cutoff),
  ]);

  const habits = (habitsRes.data ?? []) as Habit[];
  const completions = (completionsRes.data ?? []) as { habit_id: string; completion_date: string }[];

  return NextResponse.json(getMonthSummary(habits, completions));
}
