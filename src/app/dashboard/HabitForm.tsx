"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Category } from "@/types/database";
import type { Recurrence } from "@/types/recurrence";
import { RecurrencePicker } from "./RecurrencePicker";
import { CategorySelect } from "./CategorySelect";

const DEFAULT_RECURRENCE: Recurrence = { type: "weekly", days: [1, 2, 3, 4, 5], interval: 1 };

type CreateHabitFn = (formData: FormData) => Promise<{ error: string | null }>;
type CreateCategoryFn = (formData: FormData) => Promise<{ error: string | null }>;

export function HabitForm({
  categories,
  createHabit,
  createCategory,
}: {
  categories: Category[];
  createHabit: CreateHabitFn;
  createCategory: CreateCategoryFn;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [recurrence, setRecurrence] = useState<Recurrence>(DEFAULT_RECURRENCE);
  const [xpReward, setXpReward] = useState(20);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [categoryPending, setCategoryPending] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(categories[0]?.id ?? "");
  const [timeOfDay, setTimeOfDay] = useState("");
  const [note, setNote] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (
      (recurrence.type === "weekly" || recurrence.type === "biweekly") &&
      recurrence.days.length === 0
    ) {
      setError("Select at least one day for the recurrence");
      return;
    }
    if (
      recurrence.type === "monthly" &&
      recurrence.mode === "each" &&
      recurrence.days.length === 0
    ) {
      setError("Select at least one day of the month");
      return;
    }
    if (recurrence.type === "yearly" && recurrence.months.length === 0) {
      setError("Select at least one month");
      return;
    }
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("recurrence", JSON.stringify(recurrence));
    formData.set("xp_reward", String(xpReward));
    if (timeOfDay) formData.set("time_of_day", timeOfDay);
    if (note.trim()) formData.set("note", note.trim());
    setError(null);
    setIsPending(true);
    const result = await createHabit(formData);
    setIsPending(false);
    if (result.error) {
      setError(result.error);
    } else {
      setNote("");
      setTimeOfDay("");
    }
  }

  async function handleAddCategory(e?: React.FormEvent) {
    e?.preventDefault();
    if (!newCategoryName.trim()) return;
    setCategoryError(null);
    setCategoryPending(true);
    const formData = new FormData();
    formData.set("name", newCategoryName.trim());
    const result = await createCategory(formData);
    setCategoryPending(false);
    if (result.error) {
      setCategoryError(result.error);
    } else {
      setNewCategoryName("");
      setShowAddCategory(false);
      router.refresh();
    }
  }

  return (
    <div className="space-y-4">
      {/* Empty-category prompt */}
      {categories.length === 0 ? (
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-5 mb-4">
          <p className="text-sm font-semibold text-primary mb-3">
            Add a category first, then you can create habits.
          </p>
          <form onSubmit={handleAddCategory} className="flex gap-2 flex-wrap">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="e.g. Fitness"
              className="input-field flex-1 min-w-[120px]"
              required
            />
            <button
              type="submit"
              disabled={categoryPending}
              className="btn-primary"
            >
              {categoryPending ? "Adding..." : "Add category"}
            </button>
            {categoryError && (
              <span className="text-sm text-destructive w-full">{categoryError}</span>
            )}
          </form>
        </div>
      ) : null}

      {/* Main form card */}
      <form
        onSubmit={handleSubmit}
        className="bg-card border border-border rounded-xl shadow-sm p-6 space-y-5"
      >
        <div>
          <label htmlFor="name" className="label-xs mb-1.5">
            Habit name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="input-field"
            placeholder="e.g. Morning walk"
          />
        </div>

        <div>
          <label htmlFor="category" className="label-xs mb-1.5">
            Category
          </label>
          <div className="flex gap-2 flex-wrap items-center">
            <CategorySelect
              categories={categories}
              value={selectedCategoryId}
              onChange={(id) => setSelectedCategoryId(id)}
              disabled={categories.length === 0}
              id="category"
              name="category"
            />
            {categories.length > 0 && (
              <button
                type="button"
                onClick={() => setShowAddCategory((s) => !s)}
                className={`px-4 py-2.5 rounded-full text-sm font-semibold tracking-wide transition-shadow ${
                  showAddCategory
                    ? "bg-muted text-muted-foreground border border-border hover:shadow-sm"
                    : "bg-primary/10 text-primary border border-primary/25 hover:bg-primary/20 hover:shadow-sm"
                }`}
              >
                {showAddCategory ? "Cancel" : "+ Add category"}
              </button>
            )}
          </div>
          {showAddCategory && categories.length > 0 && (
            <div className="mt-3 flex gap-2 flex-wrap items-center">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCategory();
                  }
                }}
                placeholder="New category name"
                className="input-field flex-1 min-w-[120px]"
              />
              <button
                type="button"
                onClick={() => handleAddCategory()}
                disabled={categoryPending}
                className="bg-secondary text-secondary-foreground px-4 py-2.5 rounded-full text-sm font-semibold shadow-sm hover:shadow-md transition-shadow disabled:opacity-50"
              >
                {categoryPending ? "Adding..." : "Add"}
              </button>
              {categoryError && (
                <span className="text-sm text-destructive w-full">{categoryError}</span>
              )}
            </div>
          )}
        </div>

        <div>
          <span className="label-xs mb-2">Repeat</span>
          <RecurrencePicker value={recurrence} onChange={setRecurrence} />
        </div>

        <div>
          <label htmlFor="time_of_day" className="label-xs mb-1.5">
            Time of day
          </label>
          <select
            id="time_of_day"
            value={timeOfDay}
            onChange={(e) => setTimeOfDay(e.target.value)}
            className="input-field"
          >
            <option value="">Any time</option>
            <option value="morning">Morning</option>
            <option value="afternoon">Afternoon</option>
            <option value="evening">Evening</option>
          </select>
        </div>

        <div>
          <label htmlFor="note" className="label-xs mb-1.5">
            Note
          </label>
          <textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional note or reminder..."
            rows={2}
            className="input-field resize-none"
          />
        </div>

        <div>
          <label htmlFor="xp_reward" className="label-xs mb-2">
            Difficulty — {xpReward} XP
          </label>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-muted-foreground w-6 text-right">0</span>
            <input
              id="xp_reward"
              type="range"
              min={0}
              max={100}
              step={5}
              value={xpReward}
              onChange={(e) => setXpReward(Number(e.target.value))}
              className="flex-1 h-2 rounded-full appearance-none bg-border accent-primary cursor-pointer"
            />
            <span className="text-[11px] text-muted-foreground w-6">100</span>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={isPending || categories.length === 0}
            className="btn-primary px-6"
          >
            {isPending ? "Adding..." : "Add habit"}
          </button>
          {error && (
            <span className="text-sm text-destructive">{error}</span>
          )}
        </div>
      </form>
    </div>
  );
}
