"use client";

import { CATEGORY_ICON_OPTIONS, getCategoryIcon } from "./category-icons";
import { Category } from "@/lib/firebase";
import SectionHeader from "./section-header";
import { Tags, Plus, Loader2, Trash2, Save } from "lucide-react";

interface CategoryDraft {
  name: string;
  icon: string;
}

interface CategoriesSectionProps {
  categoryDocs: Category[];
  categoryDrafts: Record<string, CategoryDraft>;
  categorySaving: Record<string, boolean>;
  categoryDeleting: Record<string, boolean>;
  categoriesLoading: boolean;
  categoriesError: string;
  onCategoryDraftChange: (id: string, field: string, value: string) => void;
  onCategorySave: (id: string) => Promise<void>;
  onCategoryDelete: (id: string) => Promise<void>;
  onOpenAddCategory: () => void;
}

export default function CategoriesSection({
  categoryDocs,
  categoryDrafts,
  categorySaving,
  categoryDeleting,
  categoriesLoading,
  categoriesError,
  onCategoryDraftChange,
  onCategorySave,
  onCategoryDelete,
  onOpenAddCategory,
}: CategoriesSectionProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <SectionHeader
        icon={<Tags className="h-5 w-5" />}
        iconClassName="bg-amber-100 text-amber-700"
        title="Categorías de la tienda"
        subtitle={
          categoriesLoading ? "Cargando categorías..." : `${categoryDocs.length} registradas`
        }
        action={
          <button
            type="button"
            onClick={onOpenAddCategory}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-700 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-green-800"
          >
            <Plus className="h-4 w-4" />
            Nueva categoría
          </button>
        }
      />
      {categoriesError && (
        <div className="mt-3 rounded-lg bg-red-100 px-3 py-2 text-sm font-semibold text-red-700">
          {categoriesError}
        </div>
      )}

      <div className="mt-5 space-y-3">
        {categoriesLoading ? (
          <div className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600">
            Cargando categorías...
          </div>
        ) : categoryDocs.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm font-semibold text-slate-500">
            <span>No hay categorías registradas.</span>
            <button
              type="button"
              onClick={onOpenAddCategory}
              className="inline-flex items-center gap-2 rounded-xl bg-green-700 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-green-800"
            >
              <Plus className="h-4 w-4" />
              Agregar tu primera categoría
            </button>
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
                      className="inline-flex items-center gap-1.5 rounded-xl bg-green-700 px-3 py-2 text-sm font-semibold text-white shadow transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={disabled}
                    >
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      {saving ? "Guardando..." : "Guardar"}
                    </button>
                    <button
                      type="button"
                      onClick={() => onCategoryDelete(category.id)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 shadow transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={disabled}
                    >
                      <Trash2 className="h-4 w-4" />
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
