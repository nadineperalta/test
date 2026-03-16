"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { Habit, Category } from "@/types/database";
import type { Recurrence } from "@/types/recurrence";
import type { ActionResult } from "@/types/actions";
import { RecurrencePicker } from "./RecurrencePicker";
import { CategorySelect } from "./CategorySelect";

export function EditHabitCard({
  habit,
  categories,
  onSave,
  onCancel,
}: {
  habit: Habit;
  categories: Category[];
  onSave: (data: {
    name: string;
    category: string;
    category_id: string;
    recurrence: Recurrence | null;
    xp_reward: number;
    time_of_day?: string | null;
    note?: string | null;
  }) => ActionResult;
  onCancel: () => void;
}) {
  const [name, setName] = useState(habit.name);
  const [categoryId, setCategoryId] = useState(habit.category_id);
  const [categoryName, setCategoryName] = useState(habit.category);
  const [recurrence, setRecurrence] = useState<Recurrence>(
    habit.recurrence ?? { type: "weekly", days: [1, 2, 3, 4, 5], interval: 1 }
  );
  const [xpReward, setXpReward] = useState(habit.xp_reward);
  const [timeOfDay, setTimeOfDay] = useState(habit.time_of_day ?? "");
  const [note, setNote] = useState(habit.note ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    setSaving(true);
    setError(null);
    const result = await onSave({
      name: name.trim(),
      category: categoryName,
      category_id: categoryId,
      recurrence,
      xp_reward: xpReward,
      time_of_day: timeOfDay || null,
      note: note.trim() || null,
    });
    setSaving(false);
    if (result.error) setError(result.error);
  }

  return (
    <div className="sm:col-span-2 bg-card border-2 border-primary/25 rounded-xl p-4 sm:p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <span className="label-xs">Edit habit</span>
        <button
          type="button"
          onClick={onCancel}
          className="p-1.5 rounded-lg hover:bg-accent"
          aria-label="Cancel editing"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <div>
        <label htmlFor={`edit-name-${habit.id}`} className="label-xs mb-1.5">
          Name
        </label>
        <input
          id={`edit-name-${habit.id}`}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input-field"
        />
      </div>

      <div>
        <label htmlFor={`edit-category-${habit.id}`} className="label-xs mb-1.5">
          Category
        </label>
        <CategorySelect
          categories={categories}
          value={categoryId}
          onChange={(id, catName) => {
            setCategoryId(id);
            setCategoryName(catName);
          }}
          id={`edit-category-${habit.id}`}
        />
      </div>

      <div>
        <span className="label-xs mb-2">Repeat</span>
        <RecurrencePicker value={recurrence} onChange={setRecurrence} />
      </div>

      <div>
        <label htmlFor={`edit-time-${habit.id}`} className="label-xs mb-1.5">
          Time of day
        </label>
        <select
          id={`edit-time-${habit.id}`}
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
        <label htmlFor={`edit-note-${habit.id}`} className="label-xs mb-1.5">
          Note
        </label>
        <textarea
          id={`edit-note-${habit.id}`}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional note..."
          rows={2}
          className="input-field resize-none"
        />
      </div>

      <div>
        <label htmlFor={`edit-xp-${habit.id}`} className="label-xs mb-2">
          Difficulty — {xpReward} XP
        </label>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-muted-foreground w-6 text-right">0</span>
          <input
            id={`edit-xp-${habit.id}`}
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
        <button type="button" onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? "Saving..." : "Save"}
        </button>
        <button type="button" onClick={onCancel} className="btn-outline">
          Cancel
        </button>
        {error && <span className="text-sm text-destructive">{error}</span>}
      </div>
    </div>
  );
}
