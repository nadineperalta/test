import { NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/supabase";
import { getLocalDateString } from "@/lib/dates";
import { getWeekSummary } from "@/lib/analytics";
import type { Habit } from "@/types/database";

export async function GET() {
  const supabase = createSupabaseClient();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const cutoff = getLocalDateString(sevenDaysAgo);

  const [habitsRes, completionsRes] = await Promise.all([
    supabase.from("habits").select("*").eq("is_archived", false),
    supabase.from("habit_completions").select("habit_id, completion_date").gte("completion_date", cutoff),
  ]);

  const habits = (habitsRes.data ?? []) as Habit[];
  const completions = (completionsRes.data ?? []) as { habit_id: string; completion_date: string }[];

  return NextResponse.json(getWeekSummary(habits, completions));
}
