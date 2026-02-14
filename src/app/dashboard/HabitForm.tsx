"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Category } from "@/types/database";
import type { Recurrence } from "@/types/recurrence";
import { RecurrencePicker } from "./RecurrencePicker";

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
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [categoryPending, setCategoryPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("recurrence", JSON.stringify(recurrence));
    setError(null);
    setIsPending(true);
    const result = await createHabit(formData);
    setIsPending(false);
    if (result.error) setError(result.error);
  }

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
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
      {categories.length === 0 ? (
        <div className="border rounded-lg p-4 bg-amber-50 mb-4">
          <p className="text-sm font-medium text-amber-800 mb-2">
            Add a category first, then you can create habits.
          </p>
          <form onSubmit={handleAddCategory} className="flex gap-2 flex-wrap">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="e.g. Fitness"
              className="flex-1 min-w-[120px] border rounded px-3 py-2 text-sm"
              required
            />
            <button
              type="submit"
              disabled={categoryPending}
              className="bg-black text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-50"
            >
              {categoryPending ? "Adding…" : "Add category"}
            </button>
            {categoryError && (
              <span className="text-sm text-red-600 w-full">{categoryError}</span>
            )}
          </form>
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="space-y-4 border p-4 rounded-lg"
      >
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Habit name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="w-full border rounded px-3 py-2 text-sm"
            placeholder="e.g. Morning walk"
          />
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium mb-1">
            Category
          </label>
          <div className="flex gap-2 flex-wrap items-center">
            <select
              id="category"
              name="category"
              required
              className="border rounded px-3 py-2 text-sm flex-1 min-w-[140px]"
              disabled={categories.length === 0}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
            {categories.length > 0 && (
              <button
                type="button"
                onClick={() => setShowAddCategory((s) => !s)}
                className="text-sm text-gray-600 hover:text-gray-800 underline"
              >
                {showAddCategory ? "Cancel" : "Add category"}
              </button>
            )}
          </div>
          {showAddCategory && categories.length > 0 && (
            <form
              onSubmit={handleAddCategory}
              className="mt-2 flex gap-2 flex-wrap items-center"
            >
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="New category name"
                className="border rounded px-3 py-2 text-sm flex-1 min-w-[120px]"
              />
              <button
                type="submit"
                disabled={categoryPending}
                className="bg-gray-700 text-white px-3 py-2 rounded text-sm font-medium disabled:opacity-50"
              >
                {categoryPending ? "Adding…" : "Add"}
              </button>
              {categoryError && (
                <span className="text-sm text-red-600 w-full">{categoryError}</span>
              )}
            </form>
          )}
        </div>
        <div>
          <span className="block text-sm font-medium mb-2">Repeat</span>
          <RecurrencePicker value={recurrence} onChange={setRecurrence} />
        </div>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isPending || categories.length === 0}
            className="bg-black text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-50"
          >
            {isPending ? "Adding…" : "Add habit"}
          </button>
          {error && (
            <span className="text-sm text-red-600">{error}</span>
          )}
        </div>
      </form>
    </div>
  );
}
