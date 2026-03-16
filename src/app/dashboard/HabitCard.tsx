"use client";

import { useState } from "react";
import { Pencil, Archive, X, Flame, Star, Clock, StickyNote, Trophy, MoreHorizontal, Check } from "lucide-react";
import type { Habit } from "@/types/database";
import type { ActionResult } from "@/types/actions";
import { formatRecurrence } from "@/types/recurrence";
import type { CategoryColor } from "@/lib/category-colors";
import type { StreakData } from "@/lib/streaks";
import { useDevice } from "@/components/DeviceContext";
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
  const { mode } = useDevice();

  if (mode === "ios") {
    return (
      <IOSHabitCard
        habit={habit}
        completed={completed}
        isDueToday={isDueToday}
        streak={streak}
        color={color}
        confirmingDelete={confirmingDelete}
        onEdit={onEdit}
        onArchive={onArchive}
        onDeleteCancel={onDeleteCancel}
        completeHabitToday={completeHabitToday}
        uncompleteHabitToday={uncompleteHabitToday}
      />
    );
  }

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
        <div className="flex items-center flex-wrap gap-1.5 sm:gap-2 min-w-0">
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
            className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-accent transition-colors"
            aria-label={`Edit ${habit.name}`}
          >
            <Pencil className="w-4 h-4 text-muted-foreground" />
          </button>
          {confirmingDelete ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onArchive}
                className="px-2 py-1 min-h-[44px] flex items-center rounded-lg bg-caramel/15 text-caramel text-[11px] font-semibold"
              >
                Archive
              </button>
              <button
                type="button"
                onClick={onDeleteCancel}
                className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-accent"
                aria-label="Cancel archive"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onArchive}
              className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-accent transition-colors"
              aria-label={`Archive ${habit.name}`}
            >
              <Archive className="w-4 h-4 text-muted-foreground" />
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

/* ─── iOS-native compact card ─────────────────────────────────── */

function IOSHabitCard({
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    const result = completed
      ? await uncompleteHabitToday(habit.id)
      : await completeHabitToday(habit.id);
    setLoading(false);
    if (result.error) console.error(result.error);
  }

  const opacity = !isDueToday && !completed ? "opacity-50" : "";

  return (
    <div
      role="listitem"
      className={`relative flex items-start gap-3 px-4 py-3.5 ${opacity} transition-opacity`}
      style={color && isDueToday && !completed ? {
        borderLeftWidth: "3px",
        borderLeftColor: color.border,
      } : undefined}
    >
      {/* Completion circle */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={loading}
        className={`shrink-0 mt-0.5 w-[26px] h-[26px] min-w-[44px] min-h-[44px] -m-[9px] flex items-center justify-center rounded-full transition-all disabled:opacity-50 ${
          completed
            ? "text-sage"
            : "text-muted-foreground/40"
        }`}
        aria-label={completed ? "Mark as incomplete" : "Mark as complete"}
      >
        {loading ? (
          <span className="w-[22px] h-[22px] rounded-full border-2 border-muted-foreground/30 border-t-primary animate-spin" />
        ) : completed ? (
          <span className="w-[22px] h-[22px] rounded-full bg-sage flex items-center justify-center">
            <Check className="w-3 h-3 text-white" strokeWidth={3} />
          </span>
        ) : (
          <span
            className="w-[22px] h-[22px] rounded-full border-2 transition-colors hover:border-primary/60"
            style={color ? { borderColor: color.border + "80" } : undefined}
          />
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0 pl-1">
        {/* Habit name */}
        <p className={`text-[15px] font-semibold leading-tight transition-colors ${
          completed ? "text-muted-foreground line-through decoration-sage/50" : "text-foreground"
        }`}>
          {habit.name}
        </p>

        {/* Metadata row */}
        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          <span className="text-[11px] text-muted-foreground tracking-wide">
            {recurrenceDisplay(habit)}
          </span>
          {streak.currentStreak > 0 && (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-caramel">
              <Flame className="w-2.5 h-2.5" />
              {streak.currentStreak}d
            </span>
          )}
          {streak.longestStreak > streak.currentStreak && (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-primary">
              <Trophy className="w-2.5 h-2.5" />
              {streak.longestStreak}d
            </span>
          )}
          <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-slate-blue dark:text-slate-blue-light">
            <Star className="w-2.5 h-2.5" />
            {habit.xp_reward}
          </span>
        </div>

        {/* Time / note */}
        {(habit.time_of_day || habit.note) && (
          <div className="flex items-center gap-2 mt-1">
            {habit.time_of_day && (
              <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
                <Clock className="w-2.5 h-2.5" />
                {TIME_LABELS[habit.time_of_day] ?? habit.time_of_day}
              </span>
            )}
            {habit.note && (
              <span className="text-[10px] text-muted-foreground truncate">
                {habit.note}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Actions menu */}
      <div className="shrink-0 relative">
        {confirmingDelete ? (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onArchive}
              className="px-2.5 py-1.5 min-h-[44px] flex items-center rounded-lg bg-caramel/15 text-caramel text-[11px] font-semibold"
            >
              Archive
            </button>
            <button
              type="button"
              onClick={onDeleteCancel}
              className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-accent"
              aria-label="Cancel"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>
        ) : menuOpen ? (
          <div className="flex items-center gap-0.5 animate-in fade-in slide-in-from-right-2 duration-150">
            <button
              type="button"
              onClick={() => { onEdit(); setMenuOpen(false); }}
              className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-accent transition-colors"
              aria-label="Edit"
            >
              <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
            <button
              type="button"
              onClick={() => { onArchive(); setMenuOpen(false); }}
              className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-accent transition-colors"
              aria-label="Archive"
            >
              <Archive className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-accent transition-colors"
              aria-label="Close menu"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-accent transition-colors"
            aria-label="More actions"
          >
            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>
    </div>
  );
}
