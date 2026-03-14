/**
 * Habit Evaluation Engine
 *
 * Pure domain logic for determining when habits are expected, whether they
 * were completed, and calculating adherence rates over arbitrary date ranges.
 *
 * Design principles:
 * - No database calls — data is passed in
 * - No UI logic — returns structured results
 * - Deterministic — same inputs always produce same outputs
 * - Delegates recurrence matching to isDueOn() from types/recurrence.ts
 *
 * Recurrence interpretation:
 * - null recurrence → habit is due every day
 * - daily with interval N → due every Nth day from a fixed epoch (2024-01-01)
 * - weekdays → Mon–Fri only
 * - weekends → Sat–Sun only
 * - weekly with days[] → due on those weekdays each week
 * - weekly with interval N → due on those weekdays every Nth week
 * - biweekly with days[] → same as weekly interval=2
 * - monthly "each" with days[] → due on those day-of-month numbers
 * - monthly "on_the" → due on e.g. "first monday" of each month
 * - yearly with months[] → due every day in those months (or specific ordinal weekday)
 *
 * Date handling:
 * - All dates normalized to YYYY-MM-DD strings for safe comparison
 * - Date objects created at T12:00:00 to avoid midnight timezone shifts
 * - String comparison of YYYY-MM-DD is chronologically correct (lexicographic order)
 */

import type { Habit } from "@/types/database";
import { isDueOn } from "@/types/recurrence";

/* ─── Types ───────────────────────────────────────────────────── */

/** Minimal completion record. Decoupled from the full DB row (no `id` needed). */
export interface CompletionRecord {
  habit_id: string;
  completion_date: string;
}

/** Result of evaluating a habit's adherence over a date range. */
export interface AdherenceResult {
  /** Number of days the habit was expected. */
  expectedCount: number;
  /** Number of expected days that were completed. */
  completedCount: number;
  /** expectedCount - completedCount. */
  missedCount: number;
  /** completedCount / expectedCount. Returns 1 when expectedCount is 0 (nothing missed). */
  adherenceRate: number;
  /** YYYY-MM-DD dates the habit was expected. */
  expectedDates: string[];
  /** YYYY-MM-DD dates the habit was both expected and completed. */
  completedDates: string[];
}

/* ─── Date Helpers ────────────────────────────────────────────── */

/**
 * Normalize any date input to a YYYY-MM-DD string in the local timezone.
 * Handles Date objects, ISO timestamps, and already-formatted strings.
 */
export function normalizeDate(date: string | Date): string {
  if (typeof date === "string") {
    // Already a clean YYYY-MM-DD — return directly
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
    // Parse ISO timestamp or other string format
    return formatLocal(new Date(date));
  }
  return formatLocal(date);
}

/** Format a Date to YYYY-MM-DD using local timezone. */
function formatLocal(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Create a Date from YYYY-MM-DD at noon to sidestep timezone boundary issues. */
function toSafeDate(dateStr: string): Date {
  return new Date(dateStr + "T12:00:00");
}

/** Return a new YYYY-MM-DD string with `days` added (can be negative). */
export function addDays(dateStr: string, days: number): string {
  const d = toSafeDate(dateStr);
  d.setDate(d.getDate() + days);
  return formatLocal(d);
}

/** True if two date inputs resolve to the same calendar day. */
export function isSameDay(a: string | Date, b: string | Date): boolean {
  return normalizeDate(a) === normalizeDate(b);
}

/* ─── Core Evaluation Functions ───────────────────────────────── */

/**
 * Determines if a habit is expected on a specific date.
 *
 * Delegates to the recurrence engine in types/recurrence.ts.
 * Habits with no recurrence config (null) are treated as due every day.
 */
export function isHabitDueOnDate(habit: Habit, date: string | Date): boolean {
  return isDueOn(habit.recurrence, normalizeDate(date));
}

/**
 * Returns all YYYY-MM-DD dates within [startDate, endDate] when the habit
 * was expected, respecting both recurrence rules and the habit's creation date.
 *
 * A habit cannot be "expected" before it was created — this prevents inflating
 * expected counts for habits added mid-range.
 *
 * Safety: capped at 731 iterations (2 years) to prevent runaway loops.
 */
export function getExpectedHabitDates(
  habit: Habit,
  startDate: string | Date,
  endDate: string | Date
): string[] {
  const start = normalizeDate(startDate);
  const end = normalizeDate(endDate);
  const createdDate = normalizeDate(habit.created_at);

  // Don't expect completions before the habit existed
  const effectiveStart = start < createdDate ? createdDate : start;

  if (effectiveStart > end) return [];

  const results: string[] = [];
  let current = effectiveStart;
  let iterations = 0;
  const MAX_ITERATIONS = 731;

  while (current <= end && iterations < MAX_ITERATIONS) {
    if (isDueOn(habit.recurrence, current)) {
      results.push(current);
    }
    current = addDays(current, 1);
    iterations++;
  }

  return results;
}

/**
 * Returns deduplicated, sorted YYYY-MM-DD completion dates for a specific
 * habit within [startDate, endDate].
 *
 * Deduplication prevents double-counting if the DB has duplicate rows
 * (shouldn't happen with the unique constraint, but defensive coding).
 */
export function getCompletedHabitDates(
  habitId: string,
  completions: CompletionRecord[],
  startDate: string | Date,
  endDate: string | Date
): string[] {
  const start = normalizeDate(startDate);
  const end = normalizeDate(endDate);

  const seen = new Set<string>();
  const results: string[] = [];

  for (const c of completions) {
    if (c.habit_id !== habitId) continue;
    const date = normalizeDate(c.completion_date);
    if (date < start || date > end) continue;
    if (seen.has(date)) continue;
    seen.add(date);
    results.push(date);
  }

  return results.sort();
}

/**
 * Calculates adherence for a single habit over a date range.
 *
 * Only counts completions on days the habit was actually expected.
 * A completion on a non-expected day is ignored (it doesn't inflate the rate).
 *
 * Edge cases:
 * - expectedCount = 0 → adherenceRate = 1 (nothing was expected, nothing was missed)
 * - No completion data → adherenceRate = 0 if anything was expected
 * - completedCount is capped at expectedCount (rate never exceeds 1.0)
 */
export function getHabitAdherence(
  habit: Habit,
  completions: CompletionRecord[],
  startDate: string | Date,
  endDate: string | Date
): AdherenceResult {
  const expectedDates = getExpectedHabitDates(habit, startDate, endDate);
  const allCompletedDates = getCompletedHabitDates(
    habit.id,
    completions,
    startDate,
    endDate
  );

  // Only count completions that fall on expected days
  const expectedSet = new Set(expectedDates);
  const completedOnExpected = allCompletedDates.filter((d) =>
    expectedSet.has(d)
  );

  const expectedCount = expectedDates.length;
  const completedCount = completedOnExpected.length;

  return {
    expectedCount,
    completedCount,
    missedCount: expectedCount - completedCount,
    adherenceRate: expectedCount > 0 ? completedCount / expectedCount : 1,
    expectedDates,
    completedDates: completedOnExpected,
  };
}
