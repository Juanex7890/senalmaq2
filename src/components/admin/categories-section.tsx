"use client";

import { useState } from "react";
import { addDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { getCategoriesCollection, getCategoryDoc, Category } from "@/lib/firebase";

// Icon components
const IconGear = ({ className = "h-5 w-5", ...props }: { className?: string; [key: string]: any }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06c.5.5 1.2.66 1.82.33h.09c.61-.24 1-.84 1-1.51V3a2 2 0 1 1 4 0v.09c0 .67.39 1.27 1 1.51.45.18.95.11 1.34-.16.39.27.89.34 1.34.16l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06c-.27.39-.34.89-.16 1.34.24.61.84 1 1.51 1H21a2 2 0 1 1 0 4h-.09c-.67 0-1.27.39-1.51 1z" />
  </svg>
);

const IconScissors = ({ className = "h-5 w-5", ...props }: { className?: string; [key: string]: any }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <circle cx="6" cy="6" r="3" />
    <circle cx="14" cy="6" r="3" />
    <path d="M8.5 8.5L21 21" />
    <path d="M21 3l-9 9" />
  </svg>
);

const IconShirt = ({ className = "h-5 w-5", ...props }: { className?: string; [key: string]: any }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M4 7l5-3 3 2 5-2 3 3v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7z" />
  </svg>
);

const IconNeedle = ({ className = "h-5 w-5", ...props }: { className?: string; [key: string]: any }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M2 22c0-4 8-14 14-18" />
    <path d="M20 4l0 4" />
    <path d="M17 7l3 3" />
  </svg>
);

const IconPackage = ({ className = "h-5 w-5", ...props }: { className?: string; [key: string]: any }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M21 16V8a2 2 0 0 0-1-1.73L12 2 4 6.27A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73L12 22l8-4.27A2 2 0 0 0 21 16z" />
    <path d="M7.5 4.21L12 6.5l4.5-2.29" />
  </svg>
);

const CATEGORY_ICON_OPTIONS = [
  { value: "gear", label: "Engranaje", icon: IconGear },
  { value: "scissors", label: "Tijeras", icon: IconScissors },
  { value: "shirt", label: "Camisa", icon: IconShirt },
  { value: "needle", label: "Aguja", icon: IconNeedle },
  { value: "package", label: "Caja", icon: IconPackage },
];

const getCategoryIcon = (iconKey: string) => {
  const match = CATEGORY_ICON_OPTIONS.find((option) => option.value === iconKey);
  return match ? match.icon : IconGear;
};

interface CategoryDraft {
  name: string;
  icon: string;
}

interface Message {
  type: "success" | "error";
  text: string;
}

interface CategoriesSectionProps {
  categoryDocs: Category[];
  categoryDrafts: Record<string, CategoryDraft>;
  categoryForm: { name: string; icon: string };
  categorySaving: Record<string, boolean>;
  categoryDeleting: Record<string, boolean>;
  categoriesLoading: boolean;
  categoriesError: string;
  onCategoryFormChange: (field: string) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onAddCategory: (event: React.FormEvent) => Promise<void>;
  onCategoryDraftChange: (id: string, field: string, value: string) => void;
  onCategorySave: (id: string) => Promise<void>;
  onCategoryDelete: (id: string) => Promise<void>;
  setMessage: (message: Message | null) => void;
}

export default function CategoriesSection({
  categoryDocs,
  categoryDrafts,
  categoryForm,
  categorySaving,
  categoryDeleting,
  categoriesLoading,
  categoriesError,
  onCategoryFormChange,
  onAddCategory,
  onCategoryDraftChange,
  onCategorySave,
  onCategoryDelete,
  setMessage,
}: CategoriesSectionProps) {
  const isAddingCategory = Boolean(categorySaving.__new__);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-bold text-green-800">Categorías de la tienda</h2>
        <span className="text-xs text-slate-500">
          {categoriesLoading ? "Cargando categorías..." : `${categoryDocs.length} registradas`}
        </span>
      </div>
      {categoriesError && (
        <div className="mt-3 rounded-lg bg-red-100 px-3 py-2 text-sm font-semibold text-red-700">
          {categoriesError}
        </div>
      )}
      <form onSubmit={onAddCategory} className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_200px_auto] md:items-end">
        <label className="block text-sm font-semibold text-slate-700">
          Nombre
          <input
            type="text"
            value={categoryForm.name}
            onChange={onCategoryFormChange("name")}
            placeholder="Nueva categoría"
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-base focus:border-green-600 focus:ring-2 focus:ring-green-100"
            disabled={isAddingCategory || categoriesLoading}
          />
        </label>
        <label className="block text-sm font-semibold text-slate-700">
          Ícono
          <select
            value={categoryForm.icon}
            onChange={onCategoryFormChange("icon")}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-base focus:border-green-600 focus:ring-2 focus:ring-green-100"
            disabled={isAddingCategory || categoriesLoading}
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
          className="inline-flex items-center justify-center rounded-xl bg-green-700 px-4 py-2 font-semibold text-white shadow transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isAddingCategory || categoriesLoading}
        >
          {isAddingCategory ? "Guardando..." : "Agregar categoría"}
        </button>
      </form>

      <div className="mt-5 space-y-3">
        {categoriesLoading ? (
          <div className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600">
            Cargando categorías...
          </div>
        ) : categoryDocs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm font-semibold text-slate-500">
            No hay categorías registradas.
          </div>
        ) : (
          categoryDocs.map((category) => {
            const draft = categoryDrafts[category.id] || {
              name: "",
              icon: "gear",
            };
            const IconComponent = getCategoryIcon(draft.icon);
            const saving = Boolean(categorySaving[category.id]);
            const removing = Boolean(categoryDeleting[category.id]);
            const disabled = saving || removing;
            return (
              <div
                key={category.id}
                className="rounded-xl border border-slate-200 bg-white/70 p-4 shadow-sm"
              >
                <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_200px_auto] md:items-end">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Nombre
                    <input
                      type="text"
                      value={draft.name || ""}
                      onChange={(event) => onCategoryDraftChange(category.id, "name", event.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-green-600 focus:ring-2 focus:ring-green-100"
                      disabled={disabled}
                    />
                  </label>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Ícono
                    <div className="mt-1 flex items-center gap-2">
                      <select
                        value={draft.icon || "gear"}
                        onChange={(event) => onCategoryDraftChange(category.id, "icon", event.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-green-600 focus:ring-2 focus:ring-green-100"
                        disabled={disabled}
                      >
                        {CATEGORY_ICON_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600">
                        <IconComponent className="h-5 w-5" />
                      </span>
                    </div>
                  </label>
                  <div className="flex gap-2 md:justify-end">
                    <button
                      type="button"
                      onClick={() => onCategorySave(category.id)}
                      className="inline-flex items-center rounded-xl bg-green-700 px-3 py-2 text-sm font-semibold text-white shadow transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={disabled}
                    >
                      {saving ? "Guardando..." : "Guardar"}
                    </button>
                    <button
                      type="button"
                      onClick={() => onCategoryDelete(category.id)}
                      className="inline-flex items-center rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 shadow transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={disabled}
                    >
                      {removing ? "Eliminando..." : "Eliminar"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
