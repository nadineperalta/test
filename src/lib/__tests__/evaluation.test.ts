import { describe, it, expect } from "vitest";
import type { Habit } from "@/types/database";
import type { CompletionRecord } from "../evaluation";
import {
  normalizeDate,
  addDays,
  isSameDay,
  isHabitDueOnDate,
  getExpectedHabitDates,
  getCompletedHabitDates,
  getHabitAdherence,
} from "../evaluation";

/* ─── Helpers ─────────────────────────────────────────────────── */

function mockHabit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: "habit-1",
    name: "Test Habit",
    category: "Test",
    frequency_per_week: 1,
    selected_days: null,
    recurrence: { type: "daily" },
    xp_reward: 20,
    created_at: "2024-01-01T00:00:00Z",
    ...overrides,
  };
}

function completion(habitId: string, date: string): CompletionRecord {
  return { habit_id: habitId, completion_date: date };
}

/* ─── normalizeDate ───────────────────────────────────────────── */

describe("normalizeDate", () => {
  it("returns YYYY-MM-DD strings unchanged", () => {
    expect(normalizeDate("2026-03-13")).toBe("2026-03-13");
  });

  it("extracts date from ISO timestamp", () => {
    // Noon UTC should always be the same day in any reasonable timezone
    const result = normalizeDate("2026-03-13T12:00:00Z");
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("formats Date objects", () => {
    const d = new Date(2026, 2, 13, 12, 0, 0); // March 13 2026, noon local
    expect(normalizeDate(d)).toBe("2026-03-13");
  });
});

/* ─── addDays ─────────────────────────────────────────────────── */

describe("addDays", () => {
  it("adds positive days", () => {
    expect(addDays("2026-03-13", 1)).toBe("2026-03-14");
    expect(addDays("2026-03-13", 7)).toBe("2026-03-20");
  });

  it("subtracts with negative days", () => {
    expect(addDays("2026-03-13", -1)).toBe("2026-03-12");
  });

  it("crosses month boundary", () => {
    expect(addDays("2026-01-31", 1)).toBe("2026-02-01");
  });

  it("crosses year boundary", () => {
    expect(addDays("2025-12-31", 1)).toBe("2026-01-01");
  });
});

/* ─── isSameDay ───────────────────────────────────────────────── */

describe("isSameDay", () => {
  it("compares two strings", () => {
    expect(isSameDay("2026-03-13", "2026-03-13")).toBe(true);
    expect(isSameDay("2026-03-13", "2026-03-14")).toBe(false);
  });

  it("compares string and Date", () => {
    const d = new Date(2026, 2, 13, 12, 0, 0);
    expect(isSameDay("2026-03-13", d)).toBe(true);
  });
});

/* ─── isHabitDueOnDate ────────────────────────────────────────── */

describe("isHabitDueOnDate", () => {
  it("daily habit is due every day", () => {
    const h = mockHabit({ recurrence: { type: "daily" } });
    expect(isHabitDueOnDate(h, "2026-03-13")).toBe(true);
    expect(isHabitDueOnDate(h, "2026-03-14")).toBe(true);
  });

  it("null recurrence is due every day", () => {
    const h = mockHabit({ recurrence: null });
    expect(isHabitDueOnDate(h, "2026-03-13")).toBe(true);
  });

  it("weekday habit skips weekends", () => {
    const h = mockHabit({ recurrence: { type: "weekdays" } });
    expect(isHabitDueOnDate(h, "2026-03-13")).toBe(true);  // Fri
    expect(isHabitDueOnDate(h, "2026-03-14")).toBe(false); // Sat
  });

  it("weekly habit respects selected days", () => {
    const h = mockHabit({
      recurrence: { type: "weekly", days: [1, 3, 5] }, // Mon, Wed, Fri
    });
    expect(isHabitDueOnDate(h, "2026-03-09")).toBe(true);  // Mon
    expect(isHabitDueOnDate(h, "2026-03-10")).toBe(false); // Tue
    expect(isHabitDueOnDate(h, "2026-03-11")).toBe(true);  // Wed
    expect(isHabitDueOnDate(h, "2026-03-13")).toBe(true);  // Fri
  });

  it("monthly each mode", () => {
    const h = mockHabit({
      recurrence: { type: "monthly", everyMonths: 1, mode: "each", days: [1, 15] },
    });
    expect(isHabitDueOnDate(h, "2026-03-01")).toBe(true);
    expect(isHabitDueOnDate(h, "2026-03-15")).toBe(true);
    expect(isHabitDueOnDate(h, "2026-03-10")).toBe(false);
  });

  it("yearly with months", () => {
    const h = mockHabit({
      recurrence: { type: "yearly", everyYears: 1, months: [3, 6] },
    });
    expect(isHabitDueOnDate(h, "2026-03-15")).toBe(true);
    expect(isHabitDueOnDate(h, "2026-06-15")).toBe(true);
    expect(isHabitDueOnDate(h, "2026-04-15")).toBe(false);
  });
});

/* ─── getExpectedHabitDates ───────────────────────────────────── */

describe("getExpectedHabitDates", () => {
  it("daily habit returns every day in range", () => {
    const h = mockHabit({ recurrence: { type: "daily" } });
    const dates = getExpectedHabitDates(h, "2026-03-10", "2026-03-14");
    expect(dates).toEqual([
      "2026-03-10",
      "2026-03-11",
      "2026-03-12",
      "2026-03-13",
      "2026-03-14",
    ]);
  });

  it("weekday habit returns only Mon-Fri", () => {
    const h = mockHabit({ recurrence: { type: "weekdays" } });
    // 2026-03-09 Mon through 2026-03-15 Sun
    const dates = getExpectedHabitDates(h, "2026-03-09", "2026-03-15");
    expect(dates).toEqual([
      "2026-03-09", // Mon
      "2026-03-10", // Tue
      "2026-03-11", // Wed
      "2026-03-12", // Thu
      "2026-03-13", // Fri
    ]);
  });

  it("returns empty for range before habit creation", () => {
    const h = mockHabit({ created_at: "2026-03-15T00:00:00Z" });
    const dates = getExpectedHabitDates(h, "2026-03-10", "2026-03-14");
    expect(dates).toEqual([]);
  });

  it("clips start to creation date if range starts before", () => {
    const h = mockHabit({
      recurrence: { type: "daily" },
      created_at: "2026-03-12T00:00:00Z",
    });
    const dates = getExpectedHabitDates(h, "2026-03-10", "2026-03-14");
    expect(dates).toEqual(["2026-03-12", "2026-03-13", "2026-03-14"]);
  });

  it("handles single-day range", () => {
    const h = mockHabit({ recurrence: { type: "daily" } });
    const dates = getExpectedHabitDates(h, "2026-03-13", "2026-03-13");
    expect(dates).toEqual(["2026-03-13"]);
  });

  it("returns empty when start > end", () => {
    const h = mockHabit({ recurrence: { type: "daily" } });
    const dates = getExpectedHabitDates(h, "2026-03-14", "2026-03-13");
    expect(dates).toEqual([]);
  });

  it("weekly habit over two weeks", () => {
    const h = mockHabit({
      recurrence: { type: "weekly", days: [1] }, // Monday only
    });
    const dates = getExpectedHabitDates(h, "2026-03-01", "2026-03-15");
    // Mondays in range: March 2, 9
    expect(dates).toEqual(["2026-03-02", "2026-03-09"]);
  });
});

/* ─── getCompletedHabitDates ──────────────────────────────────── */

describe("getCompletedHabitDates", () => {
  it("filters by habit ID and date range", () => {
    const completions = [
      completion("habit-1", "2026-03-10"),
      completion("habit-1", "2026-03-12"),
      completion("habit-1", "2026-03-20"), // out of range
      completion("habit-2", "2026-03-11"), // wrong habit
    ];
    const result = getCompletedHabitDates(
      "habit-1",
      completions,
      "2026-03-10",
      "2026-03-14"
    );
    expect(result).toEqual(["2026-03-10", "2026-03-12"]);
  });

  it("deduplicates completion dates", () => {
    const completions = [
      completion("habit-1", "2026-03-10"),
      completion("habit-1", "2026-03-10"), // duplicate
      completion("habit-1", "2026-03-11"),
    ];
    const result = getCompletedHabitDates(
      "habit-1",
      completions,
      "2026-03-10",
      "2026-03-11"
    );
    expect(result).toEqual(["2026-03-10", "2026-03-11"]);
  });

  it("returns empty for no matching completions", () => {
    const result = getCompletedHabitDates("habit-1", [], "2026-03-10", "2026-03-14");
    expect(result).toEqual([]);
  });

  it("returns sorted results", () => {
    const completions = [
      completion("habit-1", "2026-03-13"),
      completion("habit-1", "2026-03-10"),
      completion("habit-1", "2026-03-11"),
    ];
    const result = getCompletedHabitDates(
      "habit-1",
      completions,
      "2026-03-10",
      "2026-03-14"
    );
    expect(result).toEqual(["2026-03-10", "2026-03-11", "2026-03-13"]);
  });
});

/* ─── getHabitAdherence ───────────────────────────────────────── */

describe("getHabitAdherence", () => {
  it("calculates perfect adherence", () => {
    const h = mockHabit({ recurrence: { type: "daily" } });
    const completions = [
      completion("habit-1", "2026-03-10"),
      completion("habit-1", "2026-03-11"),
      completion("habit-1", "2026-03-12"),
    ];
    const result = getHabitAdherence(h, completions, "2026-03-10", "2026-03-12");
    expect(result.expectedCount).toBe(3);
    expect(result.completedCount).toBe(3);
    expect(result.missedCount).toBe(0);
    expect(result.adherenceRate).toBe(1);
  });

  it("calculates partial adherence", () => {
    const h = mockHabit({ recurrence: { type: "daily" } });
    const completions = [
      completion("habit-1", "2026-03-10"),
      // missed 2026-03-11
      completion("habit-1", "2026-03-12"),
    ];
    const result = getHabitAdherence(h, completions, "2026-03-10", "2026-03-12");
    expect(result.expectedCount).toBe(3);
    expect(result.completedCount).toBe(2);
    expect(result.missedCount).toBe(1);
    expect(result.adherenceRate).toBeCloseTo(0.667, 2);
  });

  it("zero adherence when nothing completed", () => {
    const h = mockHabit({ recurrence: { type: "daily" } });
    const result = getHabitAdherence(h, [], "2026-03-10", "2026-03-12");
    expect(result.expectedCount).toBe(3);
    expect(result.completedCount).toBe(0);
    expect(result.adherenceRate).toBe(0);
  });

  it("returns adherenceRate 1 when expectedCount is 0", () => {
    // Habit created after range ends
    const h = mockHabit({ created_at: "2026-04-01T00:00:00Z" });
    const result = getHabitAdherence(h, [], "2026-03-10", "2026-03-12");
    expect(result.expectedCount).toBe(0);
    expect(result.adherenceRate).toBe(1);
  });

  it("ignores completions on non-expected days", () => {
    // Weekday habit, but completed on weekend too
    const h = mockHabit({ recurrence: { type: "weekdays" } });
    const completions = [
      completion("habit-1", "2026-03-09"), // Mon ✓ expected
      completion("habit-1", "2026-03-14"), // Sat ✗ not expected
      completion("habit-1", "2026-03-15"), // Sun ✗ not expected
    ];
    // Mon Mar 9 through Sun Mar 15
    const result = getHabitAdherence(h, completions, "2026-03-09", "2026-03-15");
    expect(result.expectedCount).toBe(5); // Mon-Fri
    expect(result.completedCount).toBe(1); // Only Monday counted
  });

  it("weekly habit adherence over two weeks", () => {
    const h = mockHabit({
      recurrence: { type: "weekly", days: [1, 5] }, // Mon and Fri
    });
    const completions = [
      completion("habit-1", "2026-03-02"), // Mon ✓
      // missed Fri Mar 6
      completion("habit-1", "2026-03-09"), // Mon ✓
      completion("habit-1", "2026-03-13"), // Fri ✓
    ];
    const result = getHabitAdherence(h, completions, "2026-03-01", "2026-03-15");
    // Expected: Mon 2, Fri 6, Mon 9, Fri 13 = 4 days
    expect(result.expectedCount).toBe(4);
    expect(result.completedCount).toBe(3);
    expect(result.missedCount).toBe(1);
    expect(result.adherenceRate).toBe(0.75);
  });

  it("returns correct date arrays", () => {
    const h = mockHabit({ recurrence: { type: "daily" } });
    const completions = [completion("habit-1", "2026-03-10")];
    const result = getHabitAdherence(h, completions, "2026-03-10", "2026-03-12");
    expect(result.expectedDates).toEqual([
      "2026-03-10",
      "2026-03-11",
      "2026-03-12",
    ]);
    expect(result.completedDates).toEqual(["2026-03-10"]);
  });
});
