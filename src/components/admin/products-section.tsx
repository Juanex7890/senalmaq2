"use client";

import { useMemo, useState } from "react";
import { Product } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import ProductImageUploader from "./product-image-uploader";
import SectionHeader from "./section-header";
import {
  Package,
  Search,
  ChevronDown,
  Plus,
  Trash2,
  Save,
  Loader2,
} from "lucide-react";

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
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
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

function isValidImageUrl(value: string) {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function pickFirstValidImage(images: string[]) {
  if (!Array.isArray(images)) return "";
  for (const item of images) {
    if (typeof item === "string" && isValidImageUrl(item)) {
      return item.trim();
    }
  }
  return "";
}

interface ProductCardProps {
  product: Product;
  draft: ProductDraft;
  formatPrice: Intl.NumberFormat | null;
  categoryOptions: string[];
  isSaving: boolean;
  isDeleting: boolean;
  onDraftChange: (id: string, field: string, value: any) => void;
  onDraftImageChange: (id: string, index: number, value: string) => void;
  onDraftAddImage: (id: string) => void;
  onDraftRemoveImage: (id: string, index: number) => void;
  onSave: (docId: string) => Promise<void>;
  onDeleteProduct: (docId: string) => Promise<void>;
  resolveCategoryName: (value: string) => string;
  sanitizeImageList: (value: any) => string[];
  ensureImageList: (value: any) => string[];
  defaultExpanded: boolean;
}

function ProductCard({
  product,
  draft,
  formatPrice,
  categoryOptions,
  isSaving,
  isDeleting,
  onDraftChange,
  onDraftImageChange,
  onDraftAddImage,
  onDraftRemoveImage,
  onSave,
  onDeleteProduct,
  resolveCategoryName,
  sanitizeImageList,
  ensureImageList,
  defaultExpanded,
}: ProductCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

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
  const draftCategoryRaw = typeof draft.category === "string" ? draft.category : "";
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
    typeof draft.bestSeller === "boolean" ? draft.bestSeller : Boolean(product.bestSeller);
  const draftConsultRequired =
    typeof draft.consultRequired === "boolean"
      ? draft.consultRequired
      : Boolean(product.consultRequired);
  const draftConsultNote =
    typeof draft.consultNote === "string" ? draft.consultNote : product.consultNote || "";
  const disableActions = isSaving || isDeleting;
  const canRemoveDraftImage = draftImages.length > 1;
  const displayPrice = formatPrice ? formatPrice.format(Number(draft.price) || 0) : null;

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full items-start gap-3 p-4 text-left"
      >
        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">
          <img src={displayImage} alt={displayName} className="h-full w-full object-cover" />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-bold text-slate-900">{displayName}</h3>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {displayCategory}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {displayPrice && !draftConsultRequired && (
              <span className="text-sm font-bold text-green-700">{displayPrice}</span>
            )}
            {draftConsultRequired && (
              <Badge variant="outline" size="sm" className="border-amber-300 text-amber-700">
                Consulta
              </Badge>
            )}
            {draftBestSeller && (
              <Badge variant="success" size="sm">
                Más vendida
              </Badge>
            )}
          </div>
        </div>

        <ChevronDown
          className={`mt-1 h-5 w-5 flex-shrink-0 text-slate-400 transition-transform ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {expanded && (
        <div className="space-y-3 border-t border-slate-100 p-4 pt-4 animate-fade-in">
          <label className="block text-sm font-semibold text-slate-700">
            Nombre
            <input
              type="text"
              value={draft.name ?? ""}
              onChange={(event) => onDraftChange(product.docId, "name", event.target.value)}
              onBlur={() => onSave(product.docId)}
              placeholder="Nombre del producto"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-base focus:border-green-600 focus:ring-2 focus:ring-green-100"
              disabled={isDeleting}
            />
          </label>

          <label className="block text-sm font-semibold text-slate-700">
            Precio
            <div className="mt-1 flex items-center gap-2">
              {displayPrice ? (
                <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                  {displayPrice}
                </span>
              ) : null}
              <input
                type="number"
                step="1000"
                min="0"
                value={draft.price ?? ""}
                onChange={(event) => onDraftChange(product.docId, "price", event.target.value)}
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
              onChange={(event) => onDraftChange(product.docId, "consultNote", event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-green-600 focus:ring-2 focus:ring-green-100"
              placeholder="Precio variable por configuración"
              disabled={!draftConsultRequired || isDeleting}
            />
          </label>

          <label className="block text-sm font-semibold text-slate-700">
            Categoría
            <select
              value={selectCategoryValue}
              onChange={(event) => onDraftChange(product.docId, "category", event.target.value)}
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
              onChange={(event) => onDraftChange(product.docId, "bestSeller", event.target.checked)}
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
              onChange={(event) => onDraftChange(product.docId, "description", event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-green-600 focus:ring-2 focus:ring-green-100"
              disabled={isDeleting}
            />
          </label>

          <div className="rounded-2xl border border-dashed border-slate-200 p-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-700">Imágenes</p>
              <button
                type="button"
                onClick={() => onDraftAddImage(product.docId)}
                disabled={isDeleting}
                className="inline-flex items-center gap-1 rounded-lg border border-green-200 px-3 py-1 text-xs font-semibold text-green-700 transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Plus className="h-3.5 w-3.5" />
                Agregar imagen
              </button>
            </div>
            <div className="mt-3 max-h-72 space-y-3 overflow-y-auto pr-1">
              {draftImages.map((imageValue, index) => (
                <ProductImageUploader
                  key={index}
                  index={index}
                  value={imageValue}
                  altLabel={`Vista previa ${displayName}`}
                  canRemove={canRemoveDraftImage}
                  disabled={isDeleting}
                  onChange={(value) => onDraftImageChange(product.docId, index, value)}
                  onRemove={() => onDraftRemoveImage(product.docId, index)}
                  onUploaded={() => onSave(product.docId)}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            {product.id && (
              <span className="rounded bg-slate-100 px-2 py-1">ID: {product.id}</span>
            )}
            <span className="rounded bg-slate-100 px-2 py-1 break-all">
              Doc: {product.docId}
            </span>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => onSave(product.docId)}
              disabled={disableActions}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-700 py-2 font-semibold text-white shadow transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isSaving ? "Guardando..." : "Guardar cambios"}
            </button>
            <button
              type="button"
              onClick={() => onDeleteProduct(product.docId)}
              disabled={disableActions}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-2 text-sm font-semibold text-red-600 shadow transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Trash2 className="h-4 w-4" />
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

export default function ProductsSection({
  products,
  drafts,
  saving,
  deleting,
  categoryOptions,
  searchTerm,
  onSearchTermChange,
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

  const searchTermTrimmed = searchTerm.trim();
  const normalizedSearch = searchTermTrimmed.toLowerCase();

  const filteredProducts = useMemo(() => {
    if (!normalizedSearch) {
      return products;
    }

    return products.filter((product) => {
      const haystack = [
        product.name,
        product.description,
        product.category,
        product.id,
        product.docId,
        product.search,
      ];

      return haystack.some((value) => {
        if (typeof value === "string" && value.trim()) {
          return value.toLowerCase().includes(normalizedSearch);
        }
        return false;
      });
    });
  }, [products, normalizedSearch]);

  const hasSearch = searchTermTrimmed.length > 0;
  const emptyStateMessage = hasSearch
    ? `No se encontraron productos para "${searchTermTrimmed}".`
    : "No hay productos registrados.";

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <SectionHeader
        icon={<Package className="h-5 w-5" />}
        title="Productos"
        subtitle={
          products.length
            ? `${products.length} producto${products.length === 1 ? "" : "s"} registrado${
                products.length === 1 ? "" : "s"
              }`
            : "Edita los productos existentes"
        }
        action={
          products.length > 0 ? (
            <div className="relative sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => onSearchTermChange(event.target.value)}
                placeholder="Buscar por nombre, categoría o ID"
                className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-sm focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>
          ) : undefined
        }
      />

      {filteredProducts.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm font-semibold text-slate-500">
          {emptyStateMessage}
        </div>
      ) : (
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.docId || product.id}
              product={product}
              draft={drafts[product.docId] || ({} as ProductDraft)}
              formatPrice={formatPrice}
              categoryOptions={categoryOptions}
              isSaving={Boolean(saving[product.docId])}
              isDeleting={Boolean(deleting[product.docId])}
              onDraftChange={onDraftChange}
              onDraftImageChange={onDraftImageChange}
              onDraftAddImage={onDraftAddImage}
              onDraftRemoveImage={onDraftRemoveImage}
              onSave={onSave}
              onDeleteProduct={onDeleteProduct}
              resolveCategoryName={resolveCategoryName}
              sanitizeImageList={sanitizeImageList}
              ensureImageList={ensureImageList}
              defaultExpanded={false}
            />
          ))}
        </div>
      )}
    </section>
  );
}
