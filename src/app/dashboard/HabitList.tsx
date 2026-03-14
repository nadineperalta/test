"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Habit, Category } from "@/types/database";
import type { Recurrence } from "@/types/recurrence";
import type { ActionResult } from "@/types/actions";
import type { CategoryColor } from "@/lib/category-colors";
import { HabitCard } from "./HabitCard";
import { EditHabitCard } from "./EditHabitCard";

export function HabitList({
  habits,
  completedTodayIds,
  dueTodayIds,
  streaks,
  categories,
  categoryColorMap,
  completeHabitToday,
  uncompleteHabitToday,
  deleteHabit,
  updateHabit,
}: {
  habits: Habit[];
  completedTodayIds: Set<string>;
  dueTodayIds: Set<string>;
  streaks: Record<string, number>;
  categories: Category[];
  categoryColorMap: Record<string, CategoryColor>;
  completeHabitToday: (id: string) => ActionResult;
  uncompleteHabitToday: (id: string) => ActionResult;
  deleteHabit: (id: string) => ActionResult;
  updateHabit: (
    id: string,
    data: { name: string; category: string; recurrence: Recurrence | null; xp_reward: number }
  ) => ActionResult;
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<"due" | "all">("due");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const dueCount = habits.filter((h) => dueTodayIds.has(h.id)).length;

  // Categories that actually have habits
  const usedCategories = categories.filter((c) =>
    habits.some((h) => h.category === c.name)
  );

  // Apply both filters
  let displayed =
    filter === "due"
      ? habits.filter((h) => dueTodayIds.has(h.id))
      : habits;
  if (selectedCategory) {
    displayed = displayed.filter((h) => h.category === selectedCategory);
  }

  async function handleDelete(habitId: string) {
    const result = await deleteHabit(habitId);
    if (!result.error) {
      setConfirmDeleteId(null);
      router.refresh();
    }
  }

  async function handleUpdate(
    habitId: string,
    data: { name: string; category: string; recurrence: Recurrence | null; xp_reward: number }
  ) {
    const result = await updateHabit(habitId, data);
    if (!result.error) {
      setEditingId(null);
      router.refresh();
    }
    return result;
  }

  if (habits.length === 0) {
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
      {/* Filter tabs */}
      <div className="flex gap-2" role="tablist" aria-label="Habit filters">
        <button
          role="tab"
          aria-selected={filter === "due"}
          onClick={() => setFilter("due")}
          className={`px-4 py-2 rounded-full text-sm font-semibold tracking-wide transition-shadow ${
            filter === "due"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-card text-muted-foreground border border-border hover:shadow-sm"
          }`}
        >
          Due today ({dueCount})
        </button>
        <button
          role="tab"
          aria-selected={filter === "all"}
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-full text-sm font-semibold tracking-wide transition-shadow ${
            filter === "all"
              ? "bg-secondary text-secondary-foreground shadow-sm"
              : "bg-card text-muted-foreground border border-border hover:shadow-sm"
          }`}
        >
          All habits ({habits.length})
        </button>
      </div>

      {/* Category filter */}
      {usedCategories.length > 1 && (
        <div className="flex gap-1.5 flex-wrap" role="group" aria-label="Filter by category">
          <button
            type="button"
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1 rounded-lg text-xs font-medium tracking-wide transition-colors ${
              selectedCategory === null
                ? "bg-foreground/10 text-foreground border border-foreground/20"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
          >
            All categories
          </button>
          {usedCategories.map((cat) => {
            const color = categoryColorMap[cat.name];
            const isActive = selectedCategory === cat.name;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() =>
                  setSelectedCategory(isActive ? null : cat.name)
                }
                className="px-3 py-1 rounded-lg text-xs font-medium tracking-wide transition-colors border"
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
        </div>
      )}

      {displayed.length === 0 ? (
        <div className="bg-card rounded-xl border border-border shadow-sm p-8 text-center">
          <p className="text-muted-foreground text-sm">
            {selectedCategory
              ? `No ${filter === "due" ? "due " : ""}habits in ${selectedCategory}.`
              : filter === "due"
                ? "No habits due today. Nice work, or switch to All habits."
                : "No habits yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" role="list">
          {displayed.map((habit) =>
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
                streak={streaks[habit.id] ?? 0}
                color={categoryColorMap[habit.category]}
                confirmingDelete={confirmDeleteId === habit.id}
                onEdit={() => setEditingId(habit.id)}
                onDeleteRequest={() => setConfirmDeleteId(habit.id)}
                onDeleteConfirm={() => handleDelete(habit.id)}
                onDeleteCancel={() => setConfirmDeleteId(null)}
                completeHabitToday={completeHabitToday}
                uncompleteHabitToday={uncompleteHabitToday}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}
