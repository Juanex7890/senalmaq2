"use client";

import { useState } from "react";
import { CATEGORY_ICON_OPTIONS, getCategoryIcon } from "./category-icons";
import { Category } from "@/lib/firebase";
import SectionHeader from "./section-header";
import Modal from "./modal";
import ProductImageUploader from "./product-image-uploader";
import { Tags, Plus, Loader2, Trash2, Save, ChevronRight } from "lucide-react";

interface CategoryDraft {
  name: string;
  icon: string;
  heroImagePath: string;
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

interface CategoryRowProps {
  category: Category;
  draft: CategoryDraft;
  isSaving: boolean;
  isDeleting: boolean;
  onCategoryDraftChange: (id: string, field: string, value: string) => void;
  onCategorySave: (id: string) => Promise<void>;
  onCategoryDelete: (id: string) => Promise<void>;
}

function CategoryRow({
  category,
  draft,
  isSaving,
  isDeleting,
  onCategoryDraftChange,
  onCategorySave,
  onCategoryDelete,
}: CategoryRowProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const IconComponent = getCategoryIcon(draft.icon);
  const disabled = isSaving || isDeleting;
  const displayName = draft.name || category.name || "Sin nombre";

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white/70 shadow-sm">
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="flex w-full items-center gap-3 p-3 text-left"
      >
        {draft.heroImagePath ? (
          <img
            src={draft.heroImagePath}
            alt={displayName}
            className="h-12 w-12 flex-shrink-0 rounded-lg object-cover"
          />
        ) : (
          <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <IconComponent className="h-6 w-6" />
          </span>
        )}
        <span className="min-w-0 flex-1 truncate text-sm font-bold text-slate-900">
          {displayName}
        </span>
        <ChevronRight className="h-5 w-5 flex-shrink-0 text-slate-400" />
      </button>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={displayName}
        icon={<Tags className="h-5 w-5" />}
        iconClassName="bg-amber-100 text-amber-700"
      >
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-700">
            Nombre
            <input
              type="text"
              value={draft.name || ""}
              onChange={(event) => onCategoryDraftChange(category.id, "name", event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-green-600 focus:ring-2 focus:ring-green-100"
              disabled={disabled}
            />
          </label>
          <label className="block text-sm font-semibold text-slate-700">
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
              <span className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600">
                <IconComponent className="h-5 w-5" />
              </span>
            </div>
          </label>
          <div className="block text-sm font-semibold text-slate-700">
            Imagen de portada (opcional)
            <div className="mt-1">
              <ProductImageUploader
                index={0}
                value={draft.heroImagePath || ""}
                altLabel={`Portada de ${displayName}`}
                canRemove
                disabled={disabled}
                onChange={(value) => onCategoryDraftChange(category.id, "heroImagePath", value)}
                onRemove={() => onCategoryDraftChange(category.id, "heroImagePath", "")}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onCategorySave(category.id)}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-green-700 px-3 py-2 text-sm font-semibold text-white shadow transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={disabled}
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isSaving ? "Guardando..." : "Guardar"}
            </button>
            <button
              type="button"
              onClick={() => {
                setModalOpen(false);
                onCategoryDelete(category.id);
              }}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 shadow transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={disabled}
            >
              <Trash2 className="h-4 w-4" />
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
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

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categoriesLoading ? (
          <div className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600 sm:col-span-2 lg:col-span-3">
            Cargando categorías...
          </div>
        ) : categoryDocs.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm font-semibold text-slate-500 sm:col-span-2 lg:col-span-3">
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
              heroImagePath: "",
            };
            return (
              <CategoryRow
                key={category.id}
                category={category}
                draft={draft}
                isSaving={Boolean(categorySaving[category.id])}
                isDeleting={Boolean(categoryDeleting[category.id])}
                onCategoryDraftChange={onCategoryDraftChange}
                onCategorySave={onCategorySave}
                onCategoryDelete={onCategoryDelete}
              />
            );
          })
        )}
      </div>
    </section>
  );
}
