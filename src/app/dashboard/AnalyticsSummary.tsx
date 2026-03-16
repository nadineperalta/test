"use client";

import { useState } from "react";
import type { PeriodSummary } from "@/lib/analytics";
type Period = "today" | "week" | "month" | "quarter";
type CategoryFilter = "all" | string;

export function AnalyticsSummary({
  today,
  week,
  month,
  quarter,
}: {
  today: PeriodSummary;
  week: PeriodSummary;
  month: PeriodSummary;
  quarter: PeriodSummary;
}) {
  const [period, setPeriod] = useState<Period>("today");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");

  const summaryMap: Record<Period, PeriodSummary> = { today, week, month, quarter };
  const current = summaryMap[period];

  // Filter stats by category if selected
  const filteredStats =
    categoryFilter === "all"
      ? current
      : (() => {
          const cat = current.byCategory[categoryFilter];
          if (!cat) return current;
          return {
            ...current,
            totalExpected: cat.expected,
            totalCompleted: cat.completed,
            overallRate: cat.adherenceRate,
          };
        })();

  const rateColor =
    filteredStats.overallRate >= 80
      ? "text-sage"
      : filteredStats.overallRate >= 50
        ? "text-caramel"
        : "text-destructive";

  const categoryNames = Object.keys(current.byCategory);

  return (
    <div className="bg-muted/60 dark:bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
      {/* Period toggle + category filter */}
      <div className="flex gap-1 p-2 bg-muted/80 dark:bg-muted/40 overflow-x-auto scrollbar-hide" role="tablist" aria-label="Analytics period">
        {(["today", "week", "month", "quarter"] as Period[]).map((p) => (
          <button
            key={p}
            role="tab"
            aria-selected={period === p}
            onClick={() => setPeriod(p)}
            className={`px-3 sm:px-4 py-2 min-h-[44px] rounded-lg text-xs font-bold uppercase tracking-wider transition-all shrink-0 ${
              period === p
                ? "bg-background text-foreground shadow-sm"
                : "bg-transparent text-muted-foreground hover:bg-background/60"
            }`}
          >
            {p}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            const idx = categoryFilter === "all" ? 0 : categoryNames.indexOf(categoryFilter) + 1;
            const next = idx >= categoryNames.length ? "all" : categoryNames[idx];
            setCategoryFilter(next);
          }}
          className={`px-3 sm:px-4 py-2 min-h-[44px] rounded-lg text-xs font-bold uppercase tracking-wider transition-all ml-auto shrink-0 ${
            categoryFilter !== "all"
              ? "bg-background text-foreground shadow-sm"
              : "bg-transparent text-muted-foreground hover:bg-background/60"
          }`}
        >
          {categoryFilter === "all" ? "All Categories" : categoryFilter}
        </button>
      </div>

      {/* Top summary stats */}
      <div className="grid grid-cols-3 gap-4 px-4 sm:px-6 py-6 sm:py-8">
        <div className="text-center">
          <p className="text-2xl sm:text-5xl font-black tabular-nums tracking-tight">{filteredStats.totalExpected}</p>
          <p className="text-[9px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest mt-2">Expected</p>
        </div>
        <div className="text-center">
          <p className="text-2xl sm:text-5xl font-black tabular-nums tracking-tight">{filteredStats.totalCompleted}</p>
          <p className="text-[9px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest mt-2">Completed</p>
        </div>
        <div className="text-center">
          <p className={`text-2xl sm:text-5xl font-black tabular-nums tracking-tight ${rateColor}`}>{filteredStats.overallRate}%</p>
          <p className="text-[9px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest mt-2">Completion Rate</p>
        </div>
      </div>
    </div>
  );
}
