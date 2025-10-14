"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { signOut } from "firebase/auth";
import { addDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/navigation";
import {
  auth,
  getProductDoc,
  getProductsCollection,
  getCategoriesCollection,
  getCategoryDoc,
  mapCategoryDocument,
  mapProductDocument,
  mapSocialDocument,
  saveSocialData,
  subscribeToCategories,
  subscribeToProducts,
  subscribeToSocial,
  SOCIAL_DEFAULTS,
  CATEGORY_DEFAULTS,
  Category,
  SocialData,
} from "@/lib/firebase";
import { Product } from "@/lib/types";


import SocialSection from "./social-section";
import CategoriesSection from "./categories-section";
import ProductsSection from "./products-section";
import NewProductSection from "./new-product-section";

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

export interface ProductDraft {
  name: string;
  price: string;
  description: string;
  category: string;
  bestSeller: boolean;
  images: string[];
}

interface CategoryDraft {
  name: string;
  icon: string;
}

interface Message {
  type: "success" | "error";
  text: string;
}

export default function AdminPanel() {
  const [user, authLoading, authError] = useAuthState(auth);
  const [products, setProducts] = useState<Product[]>([]);
  const [drafts, setDrafts] = useState<Record<string, ProductDraft>>({});
  const [message, setMessage] = useState<Message | null>(null);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [deleting, setDeleting] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [errorNotice, setErrorNotice] = useState("");
  const router = useRouter();

  const [categoryDocs, setCategoryDocs] = useState<Category[]>([]);
  const [categoryDrafts, setCategoryDrafts] = useState<Record<string, CategoryDraft>>({});
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    icon: CATEGORY_ICON_OPTIONS[0]?.value || "gear",
  });
  const [categorySaving, setCategorySaving] = useState<Record<string, boolean>>({});
  const [categoryDeleting, setCategoryDeleting] = useState<Record<string, boolean>>({});
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");

  const [socialDraft, setSocialDraft] = useState<SocialData>(SOCIAL_DEFAULTS);
  const [socialLoading, setSocialLoading] = useState(true);
  const [socialSaving, setSocialSaving] = useState(false);
  const [socialError, setSocialError] = useState("");
  const [shortSavingIndex, setShortSavingIndex] = useState<number | "new" | null>(null);
  const [shortDeletingIndex, setShortDeletingIndex] = useState<number | null>(null);
  const [shortInput, setShortInput] = useState("");

  const categoryOptions = useMemo(() => {
    return categoryDocs
      .map((category) =>
        typeof category?.name === "string" ? category.name.trim() : ""
      )
      .filter((name) => name !== "");
  }, [categoryDocs]);

  const createEmptyForm = useCallback(
    (): ProductDraft => ({
      name: "",
      price: "",
      description: "",
      category: categoryOptions[0] || "",
      bestSeller: false,
      images: [""],
    }),
    [categoryOptions]
  );
  const [newProduct, setNewProduct] = useState<ProductDraft>(() => createEmptyForm());
  const [creating, setCreating] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Social data handlers
  const persistSocialData = async (nextData: Partial<SocialData>, successText: string) => {
    setSocialSaving(true);
    setSocialError("");
    let ok = false;

    try {
      const payload = await saveSocialData(nextData);
      setSocialDraft(payload);
      setMessage({ type: "success", text: successText });
      ok = true;
    } catch (error) {
      console.error("[Admin] Failed to save social data", error);
      const errorText = "No pudimos guardar los cambios de redes sociales.";
      setSocialError(errorText);
      setMessage({ type: "error", text: errorText });
    } finally {
      setSocialSaving(false);
      setShortSavingIndex(null);
      setShortDeletingIndex(null);
    }

    return ok;
  };

  const handleSocialFieldChange = (field: keyof SocialData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value ?? "";
    setSocialError("");
    setSocialDraft((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveSocialFields = async (event: React.FormEvent) => {
    event?.preventDefault?.();
    await persistSocialData(socialDraft, "Redes sociales actualizadas.");
  };

  const handleShortChange = (index: number, value: string) => {
    setSocialError("");
    setSocialDraft((prev) => {
      const shorts = Array.isArray(prev.shorts) ? [...prev.shorts] : [];
      shorts[index] = value;
      return {
        ...prev,
        shorts,
      };
    });
  };

  const handleShortSave = async (index: number) => {
    const drafts = Array.isArray(socialDraft.shorts) ? [...socialDraft.shorts] : [];
    const updated = (drafts[index] || "").trim();
    if (!updated) {
      const errorText = "El short necesita un ID válido.";
      setSocialError(errorText);
      setMessage({ type: "error", text: errorText });
      return;
    }
    const nextShorts = drafts
      .map((item, idx) => (idx === index ? updated : (item || "").trim()))
      .filter((item) => item !== "");
    setShortSavingIndex(index);
    await persistSocialData(
      {
        ...socialDraft,
        shorts: nextShorts,
      },
      "Short actualizado."
    );
  };

  const handleShortDelete = async (index: number) => {
    const drafts = Array.isArray(socialDraft.shorts) ? [...socialDraft.shorts] : [];
    if (!drafts[index]) {
      return;
    }
    setShortDeletingIndex(index);
    const nextShorts = drafts.filter((_, idx) => idx !== index);
    await persistSocialData(
      {
        ...socialDraft,
        shorts: nextShorts,
      },
      "Short eliminado."
    );
  };

  const handleAddShort = async (event: React.FormEvent) => {
    event?.preventDefault?.();
    const trimmed = (shortInput || "").trim();
    if (!trimmed) {
      const errorText = "Escribe el ID del short.";
      setSocialError(errorText);
      setMessage({ type: "error", text: errorText });
      return;
    }
    const drafts = Array.isArray(socialDraft.shorts) ? socialDraft.shorts : [];
    const exists = drafts.some(
      (value) => (value || "").trim().toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) {
      const errorText = "Ese short ya está en la lista.";
      setSocialError(errorText);
      setMessage({ type: "error", text: errorText });
      return;
    }
    setShortSavingIndex("new");
    const success = await persistSocialData(
      {
        ...socialDraft,
        shorts: [
          ...drafts.map((item) => (item || "").trim()).filter((item) => item !== ""),
          trimmed,
        ],
      },
      "Short agregado."
    );
    if (success) {
      setShortInput("");
    }
  };

  const handleShortInputChange = (value: string) => {
    setShortInput(value);
    setSocialError("");
  };

  const handleHeroImageChange = (images: string[]) => {
    setSocialDraft((prev) => ({
      ...prev,
      heroImages: images,
    }));
    setSocialError("");
  };

  // Category management handlers
  const handleCategoryFormChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = event.target.value ?? "";
    setCategoryForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddCategory = async (event: React.FormEvent) => {
    event?.preventDefault?.();
    const rawName = categoryForm.name;
    const name = typeof rawName === "string" ? rawName.trim() : "";
    const icon =
      categoryForm.icon || CATEGORY_ICON_OPTIONS[0]?.value || CATEGORY_DEFAULTS.icon;

    if (!name) {
      setMessage({ type: "error", text: "Escribe un nombre para la categoría." });
      return;
    }

    const exists = categoryDocs.some(
      (category) => (category.name || "").toLowerCase() === name.toLowerCase()
    );
    if (exists) {
      setMessage({ type: "error", text: "Esa categoría ya existe." });
      return;
    }

    setCategorySaving((prev) => ({ ...prev, __new__: true }));
    try {
      await addDoc(getCategoriesCollection(), {
        name,
        icon,
      });
      setCategoryForm({
        name: "",
        icon: CATEGORY_ICON_OPTIONS[0]?.value || CATEGORY_DEFAULTS.icon,
      });
      setMessage({ type: "success", text: "Categoría agregada." });
    } catch (error) {
      console.error("[Admin] Failed to add category", error);
      setMessage({ type: "error", text: "No pudimos agregar la categoría." });
    } finally {
      setCategorySaving((prev) => {
        const next = { ...prev };
        delete next.__new__;
        return next;
      });
    }
  };

  const handleCategoryDraftChange = (id: string, field: string, value: string) => {
    setCategoryDrafts((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleCategorySave = async (id: string) => {
    const draft = categoryDrafts[id];
    if (!draft) {
      return;
    }
    const name = typeof draft.name === "string" ? draft.name.trim() : "";
    const icon = draft.icon || CATEGORY_DEFAULTS.icon;

    if (!name) {
      setMessage({ type: "error", text: "La categoría necesita un nombre." });
      return;
    }

    const duplicate = categoryDocs
      .filter((category) => category.id !== id)
      .some((category) => (category.name || "").toLowerCase() === name.toLowerCase());
    if (duplicate) {
      setMessage({ type: "error", text: "Ya existe otra categoría con ese nombre." });
      return;
    }

    setCategorySaving((prev) => ({ ...prev, [id]: true }));
    try {
      await updateDoc(getCategoryDoc(id), {
        name,
        icon,
      });
      setCategoryDrafts((prev) => ({
        ...prev,
        [id]: {
          name,
          icon,
        },
      }));
      setMessage({ type: "success", text: "Categoría actualizada." });
    } catch (error) {
      console.error("[Admin] Failed to update category", error);
      setMessage({ type: "error", text: "No pudimos actualizar la categoría." });
    } finally {
      setCategorySaving((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const handleCategoryDelete = async (id: string) => {
    setCategoryDeleting((prev) => ({ ...prev, [id]: true }));
    try {
      await deleteDoc(getCategoryDoc(id));
      setCategoryDrafts((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setMessage({ type: "success", text: "Categoría eliminada." });
    } catch (error) {
      console.error("[Admin] Failed to delete category", error);
      setMessage({ type: "error", text: "No pudimos eliminar la categoría." });
    } finally {
      setCategoryDeleting((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  // Product management handlers
  const sanitizeImageList = useCallback((value: any) => {
    if (!Array.isArray(value)) {
      return [];
    }

    return value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter((item) => item !== "");
  }, []);

  const ensureImageList = useCallback((value: any) => {
    if (!Array.isArray(value) || value.length === 0) {
      return [""];
    }

    return value.map((item) => (typeof item === "string" ? item : ""));
  }, []);

  const resolveCategoryName = useCallback(
    (value: string) => {
      if (typeof value !== "string") {
        return "";
      }

      const trimmed = value.trim();
      if (!trimmed) {
        return "";
      }

      const exactMatch = categoryOptions.find((name) => name === trimmed);
      if (exactMatch) {
        return exactMatch;
      }

      const lowerTrimmed = trimmed.toLowerCase();
      const caseInsensitiveMatch = categoryOptions.find(
        (name) => name.toLowerCase() === lowerTrimmed
      );
      return caseInsensitiveMatch || "";
    },
    [categoryOptions]
  );

  const handleDraftChange = (id: string, field: string, value: any) => {
    const nextValue = field === "category" ? resolveCategoryName(value) : value;

    setDrafts((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: nextValue,
      },
    }));
  };

  const handleDraftImageChange = (id: string, index: number, value: string) => {
    setDrafts((prev) => {
      const current = prev[id] || {};
      const images = ensureImageList(current.images);
      const nextImages = [...images];
      nextImages[index] = value;

      return {
        ...prev,
        [id]: {
          ...current,
          images: nextImages,
        },
      };
    });
  };

  const handleDraftAddImage = (id: string) => {
    setDrafts((prev) => {
      const current = prev[id] || {};
      const images = ensureImageList(current.images);

      return {
        ...prev,
        [id]: {
          ...current,
          images: [...images, ""],
        },
      };
    });
  };

  const handleDraftRemoveImage = (id: string, index: number) => {
    setDrafts((prev) => {
      const current = prev[id] || {};
      const images = ensureImageList(current.images);
      const nextImages = images.filter((_, position) => position !== index);

      return {
        ...prev,
        [id]: {
          ...current,
          images: ensureImageList(nextImages),
        },
      };
    });
  };

  const handleSave = async (docId: string) => {
    const draft = drafts[docId];
    if (!draft) {
      return;
    }

    if (saving[docId] || deleting[docId]) {
      return;
    }

    setSaving((prev) => ({ ...prev, [docId]: true }));

    try {
      const parsedPrice = Number(draft.price);
      const normalizedPrice =
        Number.isFinite(parsedPrice) && parsedPrice >= 0 ? parsedPrice : 0;
      const categoryValue = resolveCategoryName(draft.category);
      const sanitizedImages = sanitizeImageList(draft.images);
      const imagesToPersist = sanitizedImages;
      const primaryImage = imagesToPersist[0] || "";

      const payload = {
        price: normalizedPrice,
        description: draft.description ?? "",
        name: (draft.name ?? "").trim(),
        category: categoryValue,
        images: imagesToPersist,
        bestSeller: Boolean(draft.bestSeller),
        imageUrl: primaryImage,
      };

      await updateDoc(getProductDoc(docId), payload);
      const imagesForDraft = imagesToPersist.length ? imagesToPersist : [""];

      setDrafts((prev) => ({
        ...prev,
        [docId]: {
          ...(prev[docId] || {}),
          name: payload.name,
          category: payload.category,
          price: String(payload.price),
          description: payload.description,
          images: imagesForDraft,
          bestSeller: payload.bestSeller,
        },
      }));
      setErrorNotice("");
      setMessage({ type: "success", text: "Producto actualizado con éxito." });
    } catch (error) {
      console.error("[Admin] Error updating product", error);
      setErrorNotice("Error al guardar los cambios. Revisa la consola para más detalles.");
      setMessage({ type: "error", text: "Error al guardar los cambios." });
    } finally {
      setSaving((prev) => ({ ...prev, [docId]: false }));
    }
  };

  const handleDeleteProduct = async (docId: string) => {
    if (!docId || saving[docId] || deleting[docId]) {
      return;
    }

    const confirmed = window.confirm("¿Seguro que quieres eliminar este producto?");
    if (!confirmed) {
      return;
    }

    setDeleting((prev) => ({ ...prev, [docId]: true }));
    try {
      await deleteDoc(getProductDoc(docId));
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[docId];
        return next;
      });
      setErrorNotice("");
      setMessage({ type: "success", text: "Producto eliminado con éxito." });
    } catch (error) {
      console.error("[Admin] Error deleting product", error);
      setErrorNotice("No pudimos eliminar el producto. Intenta nuevamente.");
      setMessage({ type: "error", text: "Error al eliminar el producto." });
    } finally {
      setDeleting((prev) => ({ ...prev, [docId]: false }));
    }
  };

  // New product handlers
  const handleNewProductChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const isCheckbox = event.target.type === "checkbox";
    const rawValue = isCheckbox ? (event.target as HTMLInputElement).checked : event.target.value;
    const nextValue =
      field === "category" && typeof rawValue === "string"
        ? rawValue
          ? resolveCategoryName(rawValue)
          : ""
        : rawValue;

    setNewProduct((prev) => ({
      ...prev,
      [field]: nextValue,
    }));
  };

  const handleNewProductImageChange = (index: number, value: string) => {
    setNewProduct((prev) => {
      const images = ensureImageList(prev.images);
      const nextImages = [...images];
      nextImages[index] = value;

      return {
        ...prev,
        images: nextImages,
      };
    });
  };

  const handleAddNewProductImage = () => {
    setNewProduct((prev) => {
      const images = ensureImageList(prev.images);
      return {
        ...prev,
        images: [...images, ""],
      };
    });
  };

  const handleRemoveNewProductImage = (index: number) => {
    setNewProduct((prev) => {
      const images = ensureImageList(prev.images);
      const nextImages = images.filter((_, position) => position !== index);

      return {
        ...prev,
        images: ensureImageList(nextImages),
      };
    });
  };

  const handleAddProduct = async (event: React.FormEvent) => {
    event.preventDefault();

    if (creating) {
      return;
    }

    setCreating(true);

    const nameValue = (newProduct.name ?? "").trim();
    const descriptionValue = (newProduct.description ?? "").trim();
    const sanitizedImages = sanitizeImageList(newProduct.images);
    const primaryImageUrl = sanitizedImages[0] || "";
    const categoryValue =
      resolveCategoryName(newProduct.category) || categoryOptions[0] || "";
    const priceValue = Number(newProduct.price);
    const normalizedPrice =
      Number.isFinite(priceValue) && priceValue >= 0 ? priceValue : 0;

    try {
      await addDoc(getProductsCollection(), {
        name: nameValue,
        price: normalizedPrice,
        description: descriptionValue,
        category: categoryValue,
        images: sanitizedImages,
        imageUrl: primaryImageUrl,
        bestSeller: Boolean(newProduct.bestSeller),
      });
      setNewProduct(createEmptyForm());
      setErrorNotice("");
      setMessage({ type: "success", text: "Producto agregado con éxito." });
    } catch (error) {
      console.error("[Admin] Error adding product", error);
      setErrorNotice("No pudimos agregar el producto. Intenta nuevamente.");
      setMessage({ type: "error", text: "Error al agregar el producto." });
    } finally {
      setCreating(false);
    }
  };

  // Load social data
  useEffect(() => {
    if (!user) {
      setSocialDraft(SOCIAL_DEFAULTS);
      setSocialLoading(false);
      setSocialError("");
      setShortInput("");
      return;
    }

    setSocialLoading(true);
    setSocialError("");

    const unsubscribe = subscribeToSocial(
      (snapshot) => {
        const data = mapSocialDocument(snapshot);
        setSocialDraft(data);
        setSocialLoading(false);
        setSocialError("");
      },
      (error) => {
        console.error("[Admin] Failed to load social data", error);
        setSocialLoading(false);
        setSocialError("No pudimos cargar la configuración social.");
      }
    );

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [user]);

  // Load categories data
  useEffect(() => {
    if (!user) {
      setCategoryDocs([]);
      setCategoryDrafts({});
      setCategoriesLoading(false);
      setCategoriesError("");
      setCategoryForm({
        name: "",
        icon: CATEGORY_ICON_OPTIONS[0]?.value || "gear",
      });
      return;
    }

    setCategoriesLoading(true);
    setCategoriesError("");

    const unsubscribe = subscribeToCategories(
      (snapshot) => {
        const docs = snapshot.docs
          .map((document) => mapCategoryDocument(document))
          .filter((doc): doc is Category => doc !== null)
          .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        setCategoryDocs(docs);
        setCategoriesLoading(false);
        setCategoriesError("");
        setCategoryDrafts((prev) => {
          const next = { ...prev };
          docs.forEach((category) => {
            const sanitized = {
              name: category.name,
              icon: category.icon || "gear",
            };
            const current = prev[category.id];
            if (
              !current ||
              (current.name === category.name && current.icon === sanitized.icon)
            ) {
              next[category.id] = sanitized;
            }
          });
          Object.keys(next).forEach((id) => {
            if (!docs.find((category) => category.id === id)) {
              delete next[id];
            }
          });
          return next;
        });
      },
      (error) => {
        console.error("[Admin] Failed to load categories", error);
        setCategoriesLoading(false);
        setCategoriesError("No pudimos cargar las categorías.");
      }
    );

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [user]);

  // Load products data
  useEffect(() => {
    if (!user) {
      setProducts([]);
      setDrafts({});
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorNotice("");

    const unsubscribeProducts = subscribeToProducts(
      (snapshot) => {
        const nextProducts = snapshot.docs
          .map((document) => mapProductDocument(document))
          .filter((doc): doc is Product => doc !== null)
          .sort((a, b) => (a.name || "").localeCompare(b.name || ""));

        setProducts(nextProducts);
        setDrafts((prev) => {
          const nextDrafts = { ...prev };

          nextProducts.forEach((product) => {
            const key = product.docId;
            const matchedCategory = resolveCategoryName(product.category);
            const sanitizedProductImages = sanitizeImageList(product.images);
            const primaryImageUrl =
              typeof product.imageUrl === "string" ? product.imageUrl.trim() : "";
            const legacyImageUrl =
              typeof product.image === "string" ? product.image.trim() : "";

            if (!sanitizedProductImages.length && primaryImageUrl) {
              sanitizedProductImages.push(primaryImageUrl);
            }

            if (!sanitizedProductImages.length && legacyImageUrl) {
              sanitizedProductImages.push(legacyImageUrl);
            }

            const imagesForDraft = ensureImageList(sanitizedProductImages);
            const defaultPrice =
              typeof product.price === "number"
                ? product.price
                : Number(product.price) || 0;
            const defaultDescription =
              typeof product.description === "string" ? product.description : "";
            const defaultName = typeof product.name === "string" ? product.name : "";

            if (!nextDrafts[key]) {
              nextDrafts[key] = {
                price: String(defaultPrice),
                description: defaultDescription,
                name: defaultName,
                category: matchedCategory,
                bestSeller: Boolean(product.bestSeller),
                images: imagesForDraft,
              };
              return;
            }

            const prevEntry = nextDrafts[key];
            const trimmedPrevCategory =
              typeof prevEntry.category === "string" ? prevEntry.category.trim() : "";
            const sanitizedPrevCategory =
              trimmedPrevCategory === ""
                ? ""
                : resolveCategoryName(prevEntry.category);
            const prevImages = ensureImageList(prevEntry.images);
            const hasPrevImages = prevImages.some(
              (value) => typeof value === "string" && value.trim() !== ""
            );

            nextDrafts[key] = {
              ...prevEntry,
              images: hasPrevImages ? prevImages : imagesForDraft,
              category:
                trimmedPrevCategory === ""
                  ? ""
                  : sanitizedPrevCategory || matchedCategory,
              price:
                typeof prevEntry.price !== "undefined"
                  ? prevEntry.price
                  : String(defaultPrice),
              description:
                typeof prevEntry.description === "string" &&
                prevEntry.description.trim() !== ""
                  ? prevEntry.description
                  : defaultDescription,
              name:
                typeof prevEntry.name === "string" && prevEntry.name.trim() !== ""
                  ? prevEntry.name
                  : defaultName,
              bestSeller:
                typeof prevEntry.bestSeller === "boolean"
                  ? prevEntry.bestSeller
                  : Boolean(product.bestSeller),
            };
          });

          Object.keys(nextDrafts).forEach((id) => {
            if (!nextProducts.find((item) => item.docId === id)) {
              delete nextDrafts[id];
            }
          });

          return nextDrafts;
        });

        setLoading(false);
      },
      (error) => {
        console.error("[Admin] Firestore subscribe error", error);
        setErrorNotice("No se pudieron cargar los productos. Intenta nuevamente.");
        setMessage({ type: "error", text: "No se pudieron cargar los productos." });
        setLoading(false);
      }
    );

    return () => {
      if (typeof unsubscribeProducts === "function") {
        unsubscribeProducts();
      }
    };
  }, [user, resolveCategoryName, sanitizeImageList, ensureImageList]);

  // Update new product category when category options change
  useEffect(() => {
    setNewProduct((prev) => {
      const resolved = resolveCategoryName(prev.category);
      const fallback = categoryOptions[0] || "";
      const nextCategory = resolved || fallback;
      if (nextCategory === prev.category) {
        return prev;
      }
      return {
        ...prev,
        category: nextCategory,
      };
    });
  }, [categoryOptions, resolveCategoryName]);

  // Auto-hide success messages
  useEffect(() => {
    if (!message || message.type !== "success") {
      return undefined;
    }

    const timer = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [message]);

  // Handle auth errors
  useEffect(() => {
    if (!authError) {
      return;
    }

    console.error("[Admin] Auth error", authError);
    setErrorNotice(authError.message || "No pudimos verificar tu sesión.");
  }, [authError]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 text-green-700">
        <div className="h-12 w-12 rounded-full border-4 border-green-200 border-t-green-600 animate-spin" />
        <p className="mt-4 text-sm font-semibold">Verificando acceso...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white px-6 py-8 text-center shadow-lg">
          <h1 className="text-2xl font-bold text-green-800">Acceso restringido</h1>
          <p className="mt-3 text-sm text-slate-600">You must be logged in to access this page.</p>
          {errorNotice && (
            <div className="mt-4 rounded-lg bg-red-100 px-3 py-2 text-sm font-semibold text-red-700">
              {errorNotice}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-green-800">Panel de administración</h1>
            <p className="text-sm text-slate-500">
              Edita los productos en Firestore en tiempo real.
            </p>
          </div>
          <div className="flex flex-col gap-2 text-sm text-slate-600 md:items-end">
            {user && (
              <span className="font-semibold">
                Sesión iniciada como {user.email}
              </span>
            )}
            <div className="flex gap-2">
              <a
                href="/admin/verificar-codigo"
                className="inline-flex items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 font-semibold text-blue-600 shadow-sm transition hover:bg-blue-100"
              >
                🔍 Verificar Códigos
              </a>
              <button
                className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-red-50 px-4 py-2 font-semibold text-red-600 shadow-sm transition hover:bg-red-100"
                onClick={() => signOut(auth)}
                type="button"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 space-y-4">
        {errorNotice && (
          <div className="rounded-xl bg-red-100 px-4 py-3 text-sm font-semibold text-red-700 shadow">
            {errorNotice}
          </div>
        )}

        {message && (
          <div
            className={`rounded-xl px-4 py-3 text-sm font-semibold shadow ${
              message.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <SocialSection
          socialDraft={socialDraft}
          socialLoading={socialLoading}
          socialSaving={socialSaving}
          socialError={socialError}
          shortSavingIndex={shortSavingIndex}
          shortDeletingIndex={shortDeletingIndex}
          shortInput={shortInput}
          onSocialFieldChange={handleSocialFieldChange}
          onSaveSocialFields={handleSaveSocialFields}
          onShortChange={handleShortChange}
          onShortSave={handleShortSave}
          onShortDelete={handleShortDelete}
          onAddShort={handleAddShort}
          onShortInputChange={handleShortInputChange}
          onHeroImageChange={handleHeroImageChange}
        />

        <CategoriesSection
          categoryDocs={categoryDocs}
          categoryDrafts={categoryDrafts}
          categoryForm={categoryForm}
          categorySaving={categorySaving}
          categoryDeleting={categoryDeleting}
          categoriesLoading={categoriesLoading}
          categoriesError={categoriesError}
          onCategoryFormChange={handleCategoryFormChange}
          onAddCategory={handleAddCategory}
          onCategoryDraftChange={handleCategoryDraftChange}
          onCategorySave={handleCategorySave}
          onCategoryDelete={handleCategoryDelete}
          setMessage={setMessage}
        />

        <NewProductSection
          newProduct={newProduct}
          creating={creating}
          categoryOptions={categoryOptions}
          onNewProductChange={handleNewProductChange}
          onNewProductImageChange={handleNewProductImageChange}
          onAddNewProductImage={handleAddNewProductImage}
          onRemoveNewProductImage={handleRemoveNewProductImage}
          onAddProduct={handleAddProduct}
          resolveCategoryName={resolveCategoryName}
          sanitizeImageList={sanitizeImageList}
          ensureImageList={ensureImageList}
        />

        {loading ? (
          <div className="flex h-64 flex-col items-center justify-center text-sm font-semibold text-slate-500">
            <div className="h-12 w-12 rounded-full border-4 border-green-200 border-t-green-600 animate-spin" />
            <p className="mt-3">Cargando productos...</p>
          </div>
        ) : (
          <ProductsSection
            products={products}
            drafts={drafts}
            saving={saving}
            deleting={deleting}
            categoryOptions={categoryOptions}
            onDraftChange={handleDraftChange}
            onDraftImageChange={handleDraftImageChange}
            onDraftAddImage={handleDraftAddImage}
            onDraftRemoveImage={handleDraftRemoveImage}
            onSave={handleSave}
            onDeleteProduct={handleDeleteProduct}
            resolveCategoryName={resolveCategoryName}
            sanitizeImageList={sanitizeImageList}
            ensureImageList={ensureImageList}
          />
        )}
      </main>
    </div>
  );
}
