"use client";

import { Pencil, Archive, X, Flame, Star, Clock, StickyNote, Trophy } from "lucide-react";
import type { Habit } from "@/types/database";
import type { ActionResult } from "@/types/actions";
import { formatRecurrence } from "@/types/recurrence";
import type { CategoryColor } from "@/lib/category-colors";
import type { StreakData } from "@/lib/streaks";
import { CategoryIcon } from "./CategoryIcon";
import { CompletionToggle } from "./CompletionToggle";

function recurrenceDisplay(habit: Habit): string {
  if (habit.recurrence) return formatRecurrence(habit.recurrence);
  return `${habit.frequency_per_week}x per week${
    habit.selected_days?.length
      ? ` · ${habit.selected_days.join(", ")}`
      : ""
  }`;
}

const TIME_LABELS: Record<string, string> = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
};

export function HabitCard({
  habit,
  completed,
  isDueToday,
  streak,
  color,
  confirmingDelete,
  onEdit,
  onArchive,
  onDeleteCancel,
  completeHabitToday,
  uncompleteHabitToday,
}: {
  habit: Habit;
  completed: boolean;
  isDueToday: boolean;
  streak: StreakData;
  color?: CategoryColor;
  confirmingDelete: boolean;
  onEdit: () => void;
  onArchive: () => void;
  onDeleteCancel: () => void;
  completeHabitToday: (id: string) => ActionResult;
  uncompleteHabitToday: (id: string) => ActionResult;
}) {
  const stateClasses = completed
    ? "bg-sage/10 border-sage/25 dark:bg-sage/10 dark:border-sage/20"
    : isDueToday
      ? "bg-card border-border"
      : "bg-card border-border opacity-65";

  const cardStyle: React.CSSProperties = {};
  if (color && !completed && isDueToday) {
    cardStyle.borderLeftWidth = "4px";
    cardStyle.borderLeftColor = color.border;
    cardStyle.backgroundColor = color.cardTint;
  }

  return (
    <div
      role="listitem"
      className={`rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-3 border ${stateClasses}`}
      style={cardStyle}
    >
      {/* Top row: icon + category + pills | actions */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <CategoryIcon name={habit.category} color={color} />
          <span
            className="text-[11px] font-semibold uppercase tracking-widest shrink-0"
            style={color ? { color: color.badgeText } : undefined}
          >
            {habit.category}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-blue/10 text-slate-blue text-[10px] font-semibold shrink-0 dark:bg-slate-blue/20 dark:text-slate-blue-light">
            <Star className="w-2.5 h-2.5" />
            {habit.xp_reward} XP
          </span>
          {streak.currentStreak > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-caramel/10 text-caramel text-[10px] font-semibold shrink-0 dark:bg-caramel/20">
              <Flame className="w-2.5 h-2.5" />
              {streak.currentStreak}d
            </span>
          )}
          {streak.longestStreak > streak.currentStreak && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold shrink-0">
              <Trophy className="w-2.5 h-2.5" />
              {streak.longestStreak}d
            </span>
          )}
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            type="button"
            onClick={onEdit}
            className="p-1.5 rounded-lg hover:bg-accent transition-colors"
            aria-label={`Edit ${habit.name}`}
          >
            <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          {confirmingDelete ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onArchive}
                className="px-2 py-1 rounded-lg bg-caramel/15 text-caramel text-[11px] font-semibold"
              >
                Archive
              </button>
              <button
                type="button"
                onClick={onDeleteCancel}
                className="p-1 rounded-lg hover:bg-accent"
                aria-label="Cancel archive"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onArchive}
              className="p-1.5 rounded-lg hover:bg-accent transition-colors"
              aria-label={`Archive ${habit.name}`}
            >
              <Archive className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Habit name + recurrence */}
      <div>
        <p className="font-semibold text-foreground leading-snug">{habit.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5 tracking-wide">
          {recurrenceDisplay(habit)}
        </p>
      </div>

      {/* Time of day + note */}
      {(habit.time_of_day || habit.note) && (
        <div className="flex flex-col gap-1">
          {habit.time_of_day && (
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <Clock className="w-3 h-3" />
              {TIME_LABELS[habit.time_of_day] ?? habit.time_of_day}
            </span>
          )}
          {habit.note && (
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <StickyNote className="w-3 h-3" />
              {habit.note}
            </span>
          )}
        </div>
      )}

      {/* Completion */}
      <div className="mt-auto pt-1">
        <CompletionToggle
          habitId={habit.id}
          completed={completed}
          completeHabitToday={completeHabitToday}
          uncompleteHabitToday={uncompleteHabitToday}
        />
      </div>
    </div>
  );
}
