"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Habit, Category } from "@/types/database";
import type { Recurrence } from "@/types/recurrence";
import type { ActionResult } from "@/types/actions";
import type { CategoryColor } from "@/lib/category-colors";
import type { StreakData } from "@/lib/streaks";
import { useDevice } from "@/components/DeviceContext";
import { HabitCard } from "./HabitCard";
import { EditHabitCard } from "./EditHabitCard";
import { CategoryIcon } from "./CategoryIcon";

export function HabitList({
  habits,
  archivedHabits,
  completedTodayIds,
  dueTodayIds,
  streaks,
  categories,
  categoryColorMap,
  completeHabitToday,
  uncompleteHabitToday,
  deleteHabit,
  updateHabit,
  archiveHabit,
  unarchiveHabit,
}: {
  habits: Habit[];
  archivedHabits: Habit[];
  completedTodayIds: Set<string>;
  dueTodayIds: Set<string>;
  streaks: Record<string, StreakData>;
  categories: Category[];
  categoryColorMap: Record<string, CategoryColor>;
  completeHabitToday: (id: string) => ActionResult;
  uncompleteHabitToday: (id: string) => ActionResult;
  deleteHabit: (id: string) => ActionResult;
  updateHabit: (
    id: string,
    data: {
      name: string;
      category: string;
      category_id: string;
      recurrence: Recurrence | null;
      xp_reward: number;
      time_of_day?: string | null;
      note?: string | null;
    }
  ) => ActionResult;
  archiveHabit: (id: string) => ActionResult;
  unarchiveHabit: (id: string) => ActionResult;
}) {
  const router = useRouter();
  const { mode } = useDevice();
  const isIOS = mode === "ios";
  const [filter, setFilter] = useState<"due" | "all">("due");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmArchiveId, setConfirmArchiveId] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  const dueCount = habits.filter((h) => dueTodayIds.has(h.id)).length;

  // Categories that actually have active habits
  const usedCategories = categories.filter((c) =>
    habits.some((h) => h.category === c.name)
  );

  // Apply both filters
  let displayed =
    filter === "due"
      ? habits.filter((h) => dueTodayIds.has(h.id))
      : habits;
  if (selectedCategory) {
    const selectedCat = categories.find((c) => c.id === selectedCategory);
    if (selectedCat) {
      displayed = displayed.filter((h) => h.category === selectedCat.name);
    }
  }

  async function handleArchive(habitId: string) {
    const result = await archiveHabit(habitId);
    if (!result.error) {
      setConfirmArchiveId(null);
      router.refresh();
    }
  }

  async function handleUnarchive(habitId: string) {
    const result = await unarchiveHabit(habitId);
    if (!result.error) router.refresh();
  }

  async function handleDelete(habitId: string) {
    const result = await deleteHabit(habitId);
    if (!result.error) router.refresh();
  }

  async function handleUpdate(
    habitId: string,
    data: {
      name: string;
      category: string;
      category_id: string;
      recurrence: Recurrence | null;
      xp_reward: number;
      time_of_day?: string | null;
      note?: string | null;
    }
  ) {
    const result = await updateHabit(habitId, data);
    if (!result.error) {
      setEditingId(null);
      router.refresh();
    }
    return result;
  }

  if (habits.length === 0 && archivedHabits.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border shadow-sm p-8 text-center">
        <p className="text-muted-foreground text-sm">
          No habits yet. Add one above to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Filter tabs + category pills */}
      <div className={`flex gap-2 ${isIOS ? "overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide flex-nowrap" : "flex-wrap"}`} role="tablist" aria-label="Habit filters">
        <button
          role="tab"
          aria-selected={filter === "due" && !selectedCategory}
          onClick={() => { setFilter("due"); setSelectedCategory(null); }}
          className={`px-4 py-2 min-h-[44px] rounded-full font-semibold tracking-wide transition-shadow shrink-0 ${
            isIOS ? "text-[13px]" : "text-sm"
          } ${
            filter === "due" && !selectedCategory
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-card text-muted-foreground border border-border hover:shadow-sm"
          }`}
        >
          Due today ({dueCount})
        </button>
        <button
          role="tab"
          aria-selected={filter === "all" && !selectedCategory}
          onClick={() => { setFilter("all"); setSelectedCategory(null); }}
          className={`px-4 py-2 min-h-[44px] rounded-full font-semibold tracking-wide transition-shadow shrink-0 ${
            isIOS ? "text-[13px]" : "text-sm"
          } ${
            filter === "all" && !selectedCategory
              ? "bg-secondary text-secondary-foreground shadow-sm"
              : "bg-card text-muted-foreground border border-border hover:shadow-sm"
          }`}
        >
          All habits ({habits.length})
        </button>
        {usedCategories.map((cat) => {
          const color = categoryColorMap[cat.name];
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => {
                if (isActive) {
                  setSelectedCategory(null);
                } else {
                  setSelectedCategory(cat.id);
                  setFilter("all");
                }
              }}
              className={`px-4 py-2 min-h-[44px] rounded-full font-semibold tracking-wide transition-shadow border shrink-0 ${
                isIOS ? "text-[13px]" : "text-sm"
              }`}
              style={
                color
                  ? {
                      backgroundColor: isActive ? color.badgeBg : "transparent",
                      color: isActive ? color.badgeText : color.border,
                      borderColor: isActive ? color.badgeBorder : "transparent",
                    }
                  : undefined
              }
            >
              {cat.name}
            </button>
          );
        })}
        {archivedHabits.length > 0 && (
          <button
            type="button"
            onClick={() => setShowArchived((s) => !s)}
            className={`px-4 py-2 min-h-[44px] rounded-full font-semibold tracking-wide transition-shadow shrink-0 ${
              isIOS ? "text-[13px]" : "text-sm"
            } ${
              showArchived
                ? "bg-muted text-foreground border border-border shadow-sm"
                : "bg-card text-muted-foreground border border-border hover:shadow-sm"
            }`}
          >
            Archived ({archivedHabits.length})
          </button>
        )}
      </div>

      {/* Active habits grouped by category */}
      {displayed.length === 0 ? (
        <div className="bg-card rounded-xl border border-border shadow-sm p-8 text-center">
          <p className="text-muted-foreground text-sm">
            {selectedCategory
              ? `No ${filter === "due" ? "due " : ""}habits in this category.`
              : filter === "due"
                ? "No habits due today. Nice work, or switch to All habits."
                : "No habits yet."}
          </p>
        </div>
      ) : (
        <div className={isIOS ? "space-y-5" : "space-y-6"}>
          {categories
            .filter((cat) => displayed.some((h) => h.category === cat.name))
            .map((cat) => {
              const groupHabits = displayed.filter((h) => h.category === cat.name);
              const doneCount = groupHabits.filter((h) => completedTodayIds.has(h.id)).length;
              return (
                <div key={cat.id} className={isIOS ? "space-y-1.5" : "space-y-3"}>
                  <div className="flex items-center gap-2">
                    <CategoryIcon name={cat.name} color={categoryColorMap[cat.name]} />
                    <span className={`font-semibold ${isIOS ? "text-[13px]" : "text-sm"}`}>{cat.name}</span>
                    <span className={`text-muted-foreground ml-auto tabular-nums ${isIOS ? "text-[11px]" : "text-xs"}`}>
                      {doneCount}/{groupHabits.length} done
                    </span>
                  </div>
                  {isIOS ? (
                    /* iOS: Grouped card container like iOS Settings sections */
                    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden divide-y divide-border" role="list">
                      {groupHabits.map((habit) =>
                        editingId === habit.id ? (
                          <div key={habit.id} className="p-3">
                            <EditHabitCard
                              habit={habit}
                              categories={categories}
                              onSave={(data) => handleUpdate(habit.id, data)}
                              onCancel={() => setEditingId(null)}
                            />
                          </div>
                        ) : (
                          <HabitCard
                            key={habit.id}
                            habit={habit}
                            completed={completedTodayIds.has(habit.id)}
                            isDueToday={dueTodayIds.has(habit.id)}
                            streak={streaks[habit.id] ?? { currentStreak: 0, longestStreak: 0 }}
                            color={categoryColorMap[habit.category]}
                            confirmingDelete={confirmArchiveId === habit.id}
                            onEdit={() => setEditingId(habit.id)}
                            onArchive={() => handleArchive(habit.id)}
                            onDeleteCancel={() => setConfirmArchiveId(null)}
                            completeHabitToday={completeHabitToday}
                            uncompleteHabitToday={uncompleteHabitToday}
                          />
                        )
                      )}
                    </div>
                  ) : (
                    /* Desktop: Grid layout */
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" role="list">
                      {groupHabits.map((habit) =>
                        editingId === habit.id ? (
                          <EditHabitCard
                            key={habit.id}
                            habit={habit}
                            categories={categories}
                            onSave={(data) => handleUpdate(habit.id, data)}
                            onCancel={() => setEditingId(null)}
                          />
                        ) : (
                          <HabitCard
                            key={habit.id}
                            habit={habit}
                            completed={completedTodayIds.has(habit.id)}
                            isDueToday={dueTodayIds.has(habit.id)}
                            streak={streaks[habit.id] ?? { currentStreak: 0, longestStreak: 0 }}
                            color={categoryColorMap[habit.category]}
                            confirmingDelete={confirmArchiveId === habit.id}
                            onEdit={() => setEditingId(habit.id)}
                            onArchive={() => handleArchive(habit.id)}
                            onDeleteCancel={() => setConfirmArchiveId(null)}
                            completeHabitToday={completeHabitToday}
                            uncompleteHabitToday={uncompleteHabitToday}
                          />
                        )
                      )}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}

      {/* Archived habits */}
      {showArchived && archivedHabits.length > 0 && (
        <div className={isIOS ? "space-y-1.5" : "space-y-3"}>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Archived
          </h3>
          {isIOS ? (
            <div className="rounded-xl border border-border bg-card/50 shadow-sm overflow-hidden divide-y divide-border">
              {archivedHabits.map((habit) => (
                <div
                  key={habit.id}
                  className="flex items-center justify-between gap-2 px-4 py-3 opacity-60"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-[13px] truncate">{habit.name}</p>
                    <span className="text-[10px] text-muted-foreground">{habit.category}</span>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleUnarchive(habit.id)}
                      className="px-2.5 py-1.5 min-h-[44px] rounded-full text-[11px] font-semibold bg-primary/10 text-primary hover:bg-primary/20"
                    >
                      Restore
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(habit.id)}
                      className="px-2.5 py-1.5 min-h-[44px] rounded-full text-[11px] font-semibold bg-destructive/10 text-destructive hover:bg-destructive/20"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {archivedHabits.map((habit) => (
                <div
                  key={habit.id}
                  className="rounded-xl border border-border bg-card/50 p-4 opacity-60 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm">{habit.name}</p>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => handleUnarchive(habit.id)}
                        className="px-3 py-2 min-h-[44px] rounded-full text-[11px] font-semibold bg-primary/10 text-primary hover:bg-primary/20"
                      >
                        Restore
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(habit.id)}
                        className="px-3 py-2 min-h-[44px] rounded-full text-[11px] font-semibold bg-destructive/10 text-destructive hover:bg-destructive/20"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <span className="text-[11px] text-muted-foreground">{habit.category}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
