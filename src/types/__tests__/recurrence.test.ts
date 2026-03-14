import { describe, it, expect } from "vitest";
import { isDueOn, formatRecurrence, Recurrence } from "../recurrence";

describe("isDueOn", () => {
  it("daily with no interval is always due", () => {
    const r: Recurrence = { type: "daily" };
    expect(isDueOn(r, "2026-03-13")).toBe(true);
    expect(isDueOn(r, "2026-03-14")).toBe(true);
  });

  it("daily with interval > 1 skips days based on fixed epoch", () => {
    const r: Recurrence = { type: "daily", interval: 3 };
    // Count days since 2024-01-01; only every 3rd day from epoch should be true
    const results: boolean[] = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date("2024-01-01T12:00:00");
      d.setDate(d.getDate() + i);
      results.push(isDueOn(r, d));
    }
    // Day 0 (epoch) should be due (0 % 3 === 0), day 3 should be due
    expect(results[0]).toBe(true);
    expect(results[1]).toBe(false);
    expect(results[2]).toBe(false);
    expect(results[3]).toBe(true);
  });

  it("weekdays returns true Mon-Fri", () => {
    const r: Recurrence = { type: "weekdays" };
    // 2026-03-09 is Monday, 2026-03-14 is Saturday
    expect(isDueOn(r, "2026-03-09")).toBe(true); // Mon
    expect(isDueOn(r, "2026-03-13")).toBe(true); // Fri
    expect(isDueOn(r, "2026-03-14")).toBe(false); // Sat
    expect(isDueOn(r, "2026-03-15")).toBe(false); // Sun
  });

  it("weekends returns true Sat-Sun", () => {
    const r: Recurrence = { type: "weekends" };
    expect(isDueOn(r, "2026-03-14")).toBe(true); // Sat
    expect(isDueOn(r, "2026-03-15")).toBe(true); // Sun
    expect(isDueOn(r, "2026-03-13")).toBe(false); // Fri
  });

  it("weekly with selected days", () => {
    const r: Recurrence = { type: "weekly", days: [1, 3, 5] }; // Mon, Wed, Fri
    expect(isDueOn(r, "2026-03-09")).toBe(true); // Mon
    expect(isDueOn(r, "2026-03-10")).toBe(false); // Tue
    expect(isDueOn(r, "2026-03-11")).toBe(true); // Wed
    expect(isDueOn(r, "2026-03-13")).toBe(true); // Fri
  });

  it("biweekly uses fixed epoch, not monthly reset", () => {
    const r: Recurrence = { type: "biweekly", days: [1] }; // Mon
    // Two consecutive Mondays: one should be true, the other false
    const mon1 = isDueOn(r, "2026-03-02"); // Monday
    const mon2 = isDueOn(r, "2026-03-09"); // Monday (next week)
    expect(mon1).not.toBe(mon2); // They alternate
  });

  it("monthly each mode", () => {
    const r: Recurrence = {
      type: "monthly",
      everyMonths: 1,
      mode: "each",
      days: [1, 15],
    };
    expect(isDueOn(r, "2026-03-01")).toBe(true);
    expect(isDueOn(r, "2026-03-15")).toBe(true);
    expect(isDueOn(r, "2026-03-10")).toBe(false);
  });

  it("monthly on_the mode", () => {
    const r: Recurrence = {
      type: "monthly",
      everyMonths: 1,
      mode: "on_the",
      ordinal: "first",
      weekday: "monday",
    };
    // First Monday of March 2026 is March 2
    expect(isDueOn(r, "2026-03-02")).toBe(true);
    expect(isDueOn(r, "2026-03-09")).toBe(false); // Second Monday
  });

  it("yearly with months", () => {
    const r: Recurrence = { type: "yearly", everyYears: 1, months: [3, 6] };
    expect(isDueOn(r, "2026-03-15")).toBe(true);
    expect(isDueOn(r, "2026-06-15")).toBe(true);
    expect(isDueOn(r, "2026-04-15")).toBe(false);
  });

  it("null recurrence is always due", () => {
    expect(isDueOn(null, "2026-03-13")).toBe(true);
  });
});

describe("formatRecurrence", () => {
  it("formats daily", () => {
    expect(formatRecurrence({ type: "daily" })).toBe("Daily");
    expect(formatRecurrence({ type: "daily", interval: 3 })).toBe(
      "Every 3 days"
    );
  });

  it("formats weekdays/weekends", () => {
    expect(formatRecurrence({ type: "weekdays" })).toBe("Weekdays");
    expect(formatRecurrence({ type: "weekends" })).toBe("Weekends");
  });

  it("formats weekly", () => {
    expect(formatRecurrence({ type: "weekly", days: [1, 3, 5] })).toBe(
      "Weekly (Mon, Wed, Fri)"
    );
  });

  it("formats weekly with interval", () => {
    expect(
      formatRecurrence({ type: "weekly", days: [1], interval: 2 })
    ).toBe("Every 2 weeks (Mon)");
  });

  it("formats biweekly", () => {
    expect(
      formatRecurrence({ type: "biweekly", days: [1, 5] })
    ).toBe("Biweekly (Mon, Fri)");
  });

  it("formats monthly each", () => {
    expect(
      formatRecurrence({
        type: "monthly",
        everyMonths: 1,
        mode: "each",
        days: [1, 15],
      })
    ).toBe("each 1, 15");
  });

  it("formats monthly on_the", () => {
    expect(
      formatRecurrence({
        type: "monthly",
        everyMonths: 1,
        mode: "on_the",
        ordinal: "first",
        weekday: "monday",
      })
    ).toBe("on the first monday");
  });

  it("formats yearly", () => {
    expect(
      formatRecurrence({ type: "yearly", everyYears: 1, months: [1, 6] })
    ).toBe("Jan, Jun");
  });

  it("formats null as dash", () => {
    expect(formatRecurrence(null)).toBe("—");
  });
});
