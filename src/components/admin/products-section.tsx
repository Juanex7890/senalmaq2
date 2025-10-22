"use client";

import { useMemo } from "react";
import { Product } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

interface ProductDraft {
  name: string;
  price: string;
  description: string;
  category: string;
  bestSeller: boolean;
  images: string[];
  consultRequired: boolean;
  consultNote: string;
}

interface ProductsSectionProps {
  products: Product[];
  drafts: Record<string, ProductDraft>;
  saving: Record<string, boolean>;
  deleting: Record<string, boolean>;
  categoryOptions: string[];
  onDraftChange: (id: string, field: string, value: any) => void;
  onDraftImageChange: (id: string, index: number, value: string) => void;
  onDraftAddImage: (id: string) => void;
  onDraftRemoveImage: (id: string, index: number) => void;
  onSave: (docId: string) => Promise<void>;
  onDeleteProduct: (docId: string) => Promise<void>;
  resolveCategoryName: (value: string) => string;
  sanitizeImageList: (value: any) => string[];
  ensureImageList: (value: any) => string[];
}

export default function ProductsSection({
  products,
  drafts,
  saving,
  deleting,
  categoryOptions,
  onDraftChange,
  onDraftImageChange,
  onDraftAddImage,
  onDraftRemoveImage,
  onSave,
  onDeleteProduct,
  resolveCategoryName,
  sanitizeImageList,
  ensureImageList,
}: ProductsSectionProps) {
  const formatPrice = useMemo(() => {
    try {
      return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
      });
    } catch {
      return null;
    }
  }, []);

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

  if (products.length === 0) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-green-800">Productos</h2>
        <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm font-semibold text-slate-500">
          No hay productos registrados.
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-green-800">Productos</h2>
      <p className="mt-1 text-sm text-slate-500">Edita los productos existentes.</p>
      
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => {
          const draft = drafts[product.docId] || {};
          const draftName = draft.name ?? product.name ?? "";
          const displayName = (draftName || "").toString().trim() || "Sin nombre";
          const productFallbackImages = sanitizeImageList(product.images);
          const primaryImageUrl =
            typeof product.imageUrl === "string" ? product.imageUrl.trim() : "";
          const legacyImageUrl =
            typeof product.image === "string" ? product.image.trim() : "";

          if (!productFallbackImages.length && primaryImageUrl) {
            productFallbackImages.push(primaryImageUrl);
          }

          if (!productFallbackImages.length && legacyImageUrl) {
            productFallbackImages.push(legacyImageUrl);
          }

          const draftImages = ensureImageList(
            Array.isArray(draft.images) && draft.images.length
              ? draft.images
              : productFallbackImages.length
              ? productFallbackImages
              : [""]
          );
          const displayImage =
            pickFirstValidImage(draftImages) ||
            pickFirstValidImage(productFallbackImages) ||
            primaryImageUrl ||
            legacyImageUrl ||
            "/images/default.png";
          const draftCategoryRaw =
            typeof draft.category === "string" ? draft.category : "";
          const productCategoryRaw =
            typeof product.category === "string" ? product.category : "";
          const matchedDraftCategory = resolveCategoryName(draftCategoryRaw);
          const matchedProductCategory = resolveCategoryName(productCategoryRaw);
          const displayCategory =
            matchedDraftCategory ||
            matchedProductCategory ||
            productCategoryRaw.trim() ||
            "Sin categoría";
          const selectCategoryValue = matchedDraftCategory || "";
          const draftBestSeller =
            typeof draft.bestSeller === "boolean"
              ? draft.bestSeller
              : Boolean(product.bestSeller);
          const draftConsultRequired =
            typeof draft.consultRequired === "boolean"
              ? draft.consultRequired
              : Boolean(product.consultRequired);
          const draftConsultNote =
            typeof draft.consultNote === "string"
              ? draft.consultNote
              : product.consultNote || "";
          const isSaving = Boolean(saving[product.docId]);
          const isDeleting = Boolean(deleting[product.docId]);
          const disableActions = isSaving || isDeleting;
          const canRemoveDraftImage = draftImages.length > 1;

          return (
            <article
              key={product.docId || product.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">
                  <img
                    src={displayImage}
                    alt={displayName}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="flex-1">
                  <h2 className="text-base font-bold text-green-800">
                    {displayName}
                  </h2>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {displayCategory}
                  </p>
                  {(draftConsultRequired || product.consultRequired) && (
                    <div className="mt-2">
                      <Badge
                        variant="outline"
                        size="sm"
                        className="border-amber-300 text-amber-700"
                      >
                        Consulta
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <label className="block text-sm font-semibold text-slate-700">
                  Nombre
                  <input
                    type="text"
                    value={draft.name ?? ""}
                    onChange={(event) =>
                      onDraftChange(product.docId, "name", event.target.value)
                    }
                    onBlur={() => onSave(product.docId)}
                    placeholder="Nombre del producto"
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-base focus:border-green-600 focus:ring-2 focus:ring-green-100"
                    disabled={isDeleting}
                  />
                </label>

                <label className="block text-sm font-semibold text-slate-700">
                  Precio
                  <div className="mt-1 flex items-center gap-2">
                    {formatPrice ? (
                      <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                        {formatPrice.format(Number(draft.price) || 0)}
                      </span>
                    ) : null}
                    <input
                      type="number"
                      step="1000"
                      min="0"
                      value={draft.price ?? ""}
                      onChange={(event) =>
                        onDraftChange(product.docId, "price", event.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-base focus:border-green-600 focus:ring-2 focus:ring-green-100"
                      disabled={isDeleting}
                    />
                  </div>
                  {draftConsultRequired && (
                    <p className="mt-1 text-xs font-medium text-amber-600">
                      El precio se ocultará en la tienda.
                    </p>
                  )}
                </label>

                <div className="flex items-center gap-2">
                  <input
                    id={`consult-required-${product.docId}`}
                    type="checkbox"
                    checked={draftConsultRequired}
                    onChange={(event) =>
                      onDraftChange(product.docId, "consultRequired", event.target.checked)
                    }
                    className="h-4 w-4 rounded border-slate-300 text-green-600 focus:ring-green-500"
                    disabled={isDeleting}
                  />
                  <label
                    htmlFor={`consult-required-${product.docId}`}
                    className="text-sm font-semibold text-slate-700"
                  >
                    Requiere consulta (ocultar precio)
                  </label>
                </div>

                <label className="block text-sm font-semibold text-slate-700">
                  Nota para el asesor (opcional)
                  <input
                    type="text"
                    value={draftConsultNote}
                    onChange={(event) =>
                      onDraftChange(product.docId, "consultNote", event.target.value)
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-green-600 focus:ring-2 focus:ring-green-100"
                    placeholder="Precio variable por configuración"
                    disabled={!draftConsultRequired || isDeleting}
                  />
                </label>

                <label className="block text-sm font-semibold text-slate-700">
                  Categoría
                  <select
                    value={selectCategoryValue}
                    onChange={(event) =>
                      onDraftChange(product.docId, "category", event.target.value)
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-green-600 focus:ring-2 focus:ring-green-100"
                    disabled={isDeleting}
                  >
                    <option value="">Selecciona una categoría</option>
                    {categoryOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <input
                    id={`best-seller-${product.docId}`}
                    type="checkbox"
                    checked={draftBestSeller}
                    onChange={(event) =>
                      onDraftChange(product.docId, "bestSeller", event.target.checked)
                    }
                    className="h-4 w-4 rounded border-slate-300 text-green-600 focus:ring-green-500"
                    disabled={isDeleting}
                  />
                  <label
                    htmlFor={`best-seller-${product.docId}`}
                    className="flex-1 text-sm font-semibold text-slate-700"
                  >
                    Más vendidas
                  </label>
                </div>

                <label className="block text-sm font-semibold text-slate-700">
                  Descripción
                  <textarea
                    rows={4}
                    value={draft.description ?? ""}
                    onChange={(event) =>
                      onDraftChange(product.docId, "description", event.target.value)
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-green-600 focus:ring-2 focus:ring-green-100"
                    disabled={isDeleting}
                  />
                </label>

                <div className="rounded-2xl border border-dashed border-slate-200 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-700">Imágenes (URLs)</p>
                    <button
                      type="button"
                      onClick={() => onDraftAddImage(product.docId)}
                      disabled={isDeleting}
                      className="inline-flex items-center rounded-lg border border-green-200 px-3 py-1 text-xs font-semibold text-green-700 transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Agregar imagen
                    </button>
                  </div>
                  <div className="mt-3 max-h-60 space-y-3 overflow-y-auto pr-1">
                    {draftImages.map((imageValue, index) => {
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
                                alt={`Vista previa ${displayName} ${index + 1}`}
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
                                  onDraftImageChange(
                                    product.docId,
                                    index,
                                    event.target.value
                                  )
                                }
                                onBlur={() => onSave(product.docId)}
                                placeholder="https://..."
                                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-green-600 focus:ring-2 focus:ring-green-100"
                                disabled={isDeleting}
                              />
                              <div className="flex justify-end">
                                <button
                                  type="button"
                                  onClick={() =>
                                    onDraftRemoveImage(product.docId, index)
                                  }
                                  disabled={!canRemoveDraftImage || isDeleting}
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

                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  {product.id && (
                    <span className="rounded bg-slate-100 px-2 py-1">ID: {product.id}</span>
                  )}
                  <span className="rounded bg-slate-100 px-2 py-1 break-all">Doc: {product.docId}</span>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => onSave(product.docId)}
                    disabled={disableActions}
                    className="w-full rounded-xl bg-green-700 py-2 text-white font-semibold shadow transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSaving ? "Guardando..." : "Guardar cambios"}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteProduct(product.docId)}
                    disabled={disableActions}
                    className="w-full rounded-xl border border-red-200 bg-red-50 py-2 text-sm font-semibold text-red-600 shadow transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isDeleting ? "Eliminando..." : "Eliminar producto"}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
