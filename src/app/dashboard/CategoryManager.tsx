"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, X, ChevronDown, ChevronUp, Shield } from "lucide-react";
import type { Category } from "@/types/database";

import type { ActionResult } from "@/types/actions";

export function CategoryManager({
  categories,
  habitCountByCategory,
  deleteCategory,
  renameCategory,
}: {
  categories: Category[];
  habitCountByCategory: Record<string, number>;
  deleteCategory: (categoryId: string) => ActionResult;
  renameCategory: (categoryId: string, newName: string) => ActionResult;
}) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (categories.length === 0) return null;

  async function handleRename(categoryId: string) {
    if (!editName.trim()) return;
    setLoading(true);
    setError(null);
    const result = await renameCategory(categoryId, editName);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      setEditingId(null);
      router.refresh();
    }
  }

  async function handleDelete(categoryId: string) {
    setLoading(true);
    setError(null);
    const result = await deleteCategory(categoryId);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      setConfirmDeleteId(null);
      router.refresh();
    }
  }

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between px-5 py-3.5 text-sm font-semibold tracking-wide hover:bg-accent/50 transition-colors"
      >
        <span>Manage categories ({categories.length})</span>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
      {expanded && (
        <div className="px-5 pb-5 space-y-1.5 border-t border-border pt-3">
          {error && (
            <p className="text-sm text-destructive mb-2">{error}</p>
          )}
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between gap-2 py-2 px-3 rounded-lg hover:bg-accent/40 transition-colors"
            >
              {editingId === cat.id ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="border border-border bg-background rounded-lg px-2.5 py-1.5 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-ring/40"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRename(cat.id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRename(cat.id)}
                    disabled={loading}
                    className="px-4 py-2 min-h-[44px] rounded-full bg-primary text-primary-foreground text-xs font-semibold disabled:opacity-50"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="p-1 rounded-lg hover:bg-accent"
                    aria-label="Cancel rename"
                  >
                    <X className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex-1 min-w-0 flex items-center gap-2">
                    <span className="text-sm font-medium">{cat.name}</span>
                    {cat.is_system && (
                      <Shield className="w-3 h-3 text-muted-foreground" aria-label="System category" />
                    )}
                    <span className="text-[11px] text-muted-foreground tracking-wide">
                      ({habitCountByCategory[cat.name] || 0} habits)
                    </span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(cat.id);
                        setEditName(cat.name);
                        setError(null);
                      }}
                      className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-accent transition-colors"
                      aria-label="Rename category"
                    >
                      <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                    {cat.is_system ? (
                      <span className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center opacity-30 cursor-not-allowed" aria-label="System categories cannot be deleted">
                        <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                      </span>
                    ) : confirmDeleteId === cat.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleDelete(cat.id)}
                          disabled={loading}
                          className="px-3 py-2 min-h-[44px] rounded-full bg-destructive text-destructive-foreground text-[11px] font-semibold disabled:opacity-50"
                        >
                          Delete
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setConfirmDeleteId(null);
                            setError(null);
                          }}
                          className="p-1 rounded-lg hover:bg-accent"
                          aria-label="Cancel delete"
                        >
                          <X className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmDeleteId(cat.id);
                          setError(null);
                        }}
                        className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-accent transition-colors"
                        aria-label="Delete category"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
