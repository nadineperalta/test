"use client";

import { useState } from "react";
import type { PeriodSummary } from "@/lib/analytics";
import type { CategoryColor } from "@/lib/category-colors";

type Period = "today" | "week" | "month" | "quarter";

export function AnalyticsSummary({
  today,
  week,
  month,
  quarter,
  categoryColorMap,
}: {
  today: PeriodSummary;
  week: PeriodSummary;
  month: PeriodSummary;
  quarter: PeriodSummary;
  categoryColorMap: Record<string, CategoryColor>;
}) {
  const [period, setPeriod] = useState<Period>("today");

  const summaryMap: Record<Period, PeriodSummary> = { today, week, month, quarter };
  const current = summaryMap[period];

  const rateColor =
    current.overallRate >= 80
      ? "text-sage"
      : current.overallRate >= 50
        ? "text-caramel"
        : "text-destructive";

  const categories = Object.entries(current.byCategory);

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm p-5 space-y-4">
      {/* Period toggle */}
      <div className="flex gap-2 flex-wrap" role="tablist" aria-label="Analytics period">
        {(["today", "week", "month", "quarter"] as Period[]).map((p) => (
          <button
            key={p}
            role="tab"
            aria-selected={period === p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 min-h-[44px] rounded-full text-sm font-semibold tracking-wide transition-shadow capitalize ${
              period === p
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-card text-muted-foreground border border-border hover:shadow-sm"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Top summary stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold tabular-nums">{current.totalExpected}</p>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Expected</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold tabular-nums">{current.totalCompleted}</p>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Completed</p>
        </div>
        <div className="text-center">
          <p className={`text-2xl font-bold tabular-nums ${rateColor}`}>{current.overallRate}%</p>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Adherence</p>
        </div>
      </div>

      {/* Per-category breakdown */}
      {categories.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-border">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            By Category
          </h3>
          {categories.map(([catName, cat]) => {
            const color = categoryColorMap[catName];
            const catRateColor =
              cat.adherenceRate >= 80
                ? "text-sage"
                : cat.adherenceRate >= 50
                  ? "text-caramel"
                  : "text-destructive";
            const barPercent = Math.min(cat.adherenceRate, 100);
            return (
              <div key={catName} className="flex items-center gap-3">
                <span
                  className="text-xs sm:text-sm font-medium w-20 sm:w-28 truncate"
                  style={color ? { color: color.badgeText } : undefined}
                >
                  {catName}
                </span>
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${barPercent}%`,
                      backgroundColor: color?.border ?? "hsl(var(--primary))",
                    }}
                  />
                </div>
                <span className={`text-xs sm:text-sm font-semibold tabular-nums w-10 sm:w-12 text-right ${catRateColor}`}>
                  {cat.adherenceRate}%
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* XP placeholder */}
      <div className="pt-2 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground uppercase tracking-widest">
            Level &amp; XP (coming soon)
          </span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
          <div className="h-full w-0 rounded-full bg-muted-foreground/20" />
        </div>
      </div>
    </div>
  );
}
