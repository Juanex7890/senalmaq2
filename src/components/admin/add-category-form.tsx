"use client";

import { CATEGORY_ICON_OPTIONS } from "./category-icons";
import { Plus, Loader2 } from "lucide-react";

interface AddCategoryFormProps {
  categoryForm: { name: string; icon: string };
  isAddingCategory: boolean;
  categoriesLoading: boolean;
  onCategoryFormChange: (field: string) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onAddCategory: (event: React.FormEvent) => Promise<void>;
}

export default function AddCategoryForm({
  categoryForm,
  isAddingCategory,
  categoriesLoading,
  onCategoryFormChange,
  onAddCategory,
}: AddCategoryFormProps) {
  const disabled = isAddingCategory || categoriesLoading;

  return (
    <form onSubmit={onAddCategory} className="grid gap-3">
      <label className="block text-sm font-semibold text-slate-700">
        Nombre
        <input
          type="text"
          value={categoryForm.name}
          onChange={onCategoryFormChange("name")}
          placeholder="Nueva categoría"
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-base focus:border-green-600 focus:ring-2 focus:ring-green-100"
          disabled={disabled}
          autoFocus
        />
      </label>
      <label className="block text-sm font-semibold text-slate-700">
        Ícono
        <select
          value={categoryForm.icon}
          onChange={onCategoryFormChange("icon")}
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-base focus:border-green-600 focus:ring-2 focus:ring-green-100"
          disabled={disabled}
        >
          {CATEGORY_ICON_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-700 px-4 py-2 font-semibold text-white shadow transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={disabled}
      >
        {isAddingCategory ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Plus className="h-4 w-4" />
        )}
        {isAddingCategory ? "Guardando..." : "Agregar categoría"}
      </button>
    </form>
  );
}
