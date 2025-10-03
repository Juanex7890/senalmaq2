"use client";

import { useState } from "react";
import { ProductDraft } from "./admin-panel-complete";

interface NewProductSectionProps {
  newProduct: ProductDraft;
  creating: boolean;
  categoryOptions: string[];
  onNewProductChange: (field: string) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onNewProductImageChange: (index: number, value: string) => void;
  onAddNewProductImage: () => void;
  onRemoveNewProductImage: (index: number) => void;
  onAddProduct: (event: React.FormEvent) => Promise<void>;
  resolveCategoryName: (value: string) => string;
  sanitizeImageList: (value: any) => string[];
  ensureImageList: (value: any) => string[];
}

export default function NewProductSection({
  newProduct,
  creating,
  categoryOptions,
  onNewProductChange,
  onNewProductImageChange,
  onAddNewProductImage,
  onRemoveNewProductImage,
  onAddProduct,
  resolveCategoryName,
  sanitizeImageList,
  ensureImageList,
}: NewProductSectionProps) {
  const isValidImageUrl = (value: string) => {
    if (typeof value !== "string") {
      return false;
    }

    const trimmed = value.trim();
    if (!trimmed) {
      return false;
    }

    try {
      const parsed = new URL(trimmed);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  };

  const pickFirstValidImage = (images: string[]) => {
    if (!Array.isArray(images)) {
      return "";
    }

    for (const item of images) {
      if (typeof item === "string" && isValidImageUrl(item)) {
        return item.trim();
      }
    }

    return "";
  };

  const newProductPreviewUrl = pickFirstValidImage(newProduct.images);
  const newProductImages = ensureImageList(newProduct.images);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-green-800">Agregar nuevo producto</h2>
      <p className="mt-1 text-sm text-slate-500">Completa los campos para publicar un nuevo producto.</p>
      <form onSubmit={onAddProduct} className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="block text-sm font-semibold text-slate-700">
          Nombre
          <input
            type="text"
            value={newProduct.name}
            onChange={onNewProductChange("name")}
            placeholder="Nombre del producto"
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-base focus:border-green-600 focus:ring-2 focus:ring-green-100"
          />
        </label>
        <label className="block text-sm font-semibold text-slate-700">
          Precio
          <input
            type="number"
            min="0"
            step="1000"
            value={newProduct.price}
            onChange={onNewProductChange("price")}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-base focus:border-green-600 focus:ring-2 focus:ring-green-100"
          />
        </label>
        <div className="flex items-center gap-2 md:col-span-2">
          <input
            id="new-product-best-seller"
            type="checkbox"
            checked={Boolean(newProduct.bestSeller)}
            onChange={onNewProductChange("bestSeller")}
            className="h-4 w-4 rounded border-slate-300 text-green-600 focus:ring-green-500"
          />
          <label
            htmlFor="new-product-best-seller"
            className="text-sm font-semibold text-slate-700"
          >
            Más vendidas
          </label>
        </div>
        <label className="block text-sm font-semibold text-slate-700 md:col-span-2">
          Categoría
          <select
            value={newProduct.category ?? ""}
            onChange={onNewProductChange("category")}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-green-600 focus:ring-2 focus:ring-green-100"
          >
            <option value="">Selecciona una categoría</option>
            {categoryOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-semibold text-slate-700 md:col-span-2">
          Descripción
          <textarea
            rows={4}
            value={newProduct.description}
            onChange={onNewProductChange("description")}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-green-600 focus:ring-2 focus:ring-green-100"
          />
        </label>
        <div className="md:col-span-2 rounded-2xl border border-dashed border-slate-200 p-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">Imágenes (URLs)</p>
            <button
              type="button"
              onClick={onAddNewProductImage}
              className="inline-flex items-center rounded-lg border border-green-200 px-3 py-1 text-xs font-semibold text-green-700 transition hover:bg-green-50"
            >
              Agregar imagen
            </button>
          </div>
          {newProductPreviewUrl ? (
            <div className="mt-2 flex justify-center">
              <img
                src={newProductPreviewUrl}
                alt="Vista previa nuevo producto"
                className="max-h-24 w-auto rounded-xl object-contain"
              />
            </div>
          ) : null}
          <div className="mt-3 max-h-60 space-y-3 overflow-y-auto pr-1">
            {newProductImages.map((imageValue, index) => {
              const trimmedValue =
                typeof imageValue === "string" ? imageValue.trim() : "";
              const hasPreview = isValidImageUrl(trimmedValue);

              return (
                <div
                  key={index}
                  className="rounded-xl border border-slate-200 bg-white/60 p-3 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    {hasPreview ? (
                      <img
                        src={trimmedValue}
                        alt={`Vista previa imagen ${index + 1}`}
                        className="max-h-24 w-24 flex-shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-lg bg-slate-200 text-xs font-semibold text-slate-600">
                        Sin vista
                      </div>
                    )}
                    <div className="flex-1 space-y-2">
                      <input
                        type="url"
                        value={imageValue ?? ""}
                        onChange={(event) =>
                          onNewProductImageChange(index, event.target.value)
                        }
                        placeholder="https://..."
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-green-600 focus:ring-2 focus:ring-green-100"
                      />
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => onRemoveNewProductImage(index)}
                          disabled={newProductImages.length === 1}
                          className="text-xs font-semibold text-red-600 transition hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Eliminar imagen
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="md:col-span-2 flex justify-end">
          <button
            type="submit"
            disabled={creating}
            className="inline-flex items-center justify-center rounded-xl bg-green-700 px-4 py-2 font-semibold text-white shadow transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {creating ? "Agregando..." : "Agregar producto"}
          </button>
        </div>
      </form>
    </section>
  );
}
