"use client";

import { Pencil, Trash2, X, Flame, Star } from "lucide-react";
import type { Habit } from "@/types/database";
import type { ActionResult } from "@/types/actions";
import { formatRecurrence } from "@/types/recurrence";
import type { CategoryColor } from "@/lib/category-colors";
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

export function HabitCard({
  habit,
  completed,
  isDueToday,
  streak,
  color,
  confirmingDelete,
  onEdit,
  onDeleteRequest,
  onDeleteConfirm,
  onDeleteCancel,
  completeHabitToday,
  uncompleteHabitToday,
}: {
  habit: Habit;
  completed: boolean;
  isDueToday: boolean;
  streak: number;
  color?: CategoryColor;
  confirmingDelete: boolean;
  onEdit: () => void;
  onDeleteRequest: () => void;
  onDeleteConfirm: () => void;
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
      {/* Category icon + badge + actions */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <CategoryIcon name={habit.category} color={color} />
          <span
            className="inline-flex items-center px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-widest rounded-full border"
            style={
              color
                ? { backgroundColor: color.badgeBg, color: color.badgeText, borderColor: color.badgeBorder }
                : undefined
            }
          >
            {habit.category}
          </span>
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
                onClick={onDeleteConfirm}
                className="px-2 py-1 rounded-lg bg-destructive text-destructive-foreground text-[11px] font-semibold"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={onDeleteCancel}
                className="p-1 rounded-lg hover:bg-accent"
                aria-label="Cancel delete"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onDeleteRequest}
              className="p-1.5 rounded-lg hover:bg-accent transition-colors"
              aria-label={`Delete ${habit.name}`}
            >
              <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Name + recurrence */}
      <div>
        <p className="font-semibold text-foreground leading-snug">{habit.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5 tracking-wide">
          {recurrenceDisplay(habit)}
        </p>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3">
        {streak > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-caramel/10 text-caramel text-[11px] font-semibold dark:bg-caramel/20">
            <Flame className="w-3 h-3" />
            {streak}d streak
          </span>
        )}
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-blue/10 text-slate-blue text-[11px] font-semibold dark:bg-slate-blue/20 dark:text-slate-blue-light">
          <Star className="w-3 h-3" />
          {habit.xp_reward} XP
        </span>
      </div>

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
