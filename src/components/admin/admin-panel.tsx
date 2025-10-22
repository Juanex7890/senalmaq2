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

interface ProductDraft {
  name: string;
  price: number;
  description: string;
  category: string;
  bestSeller: boolean;
  images: string[];
  consultRequired: boolean;
  consultNote: string;
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
      price: 0,
      description: "",
      category: categoryOptions[0] || "",
      bestSeller: false,
      images: [""],
      consultRequired: false,
      consultNote: "",
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

  // Rest of the component will be implemented in the main admin page
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
            <button
              className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-red-50 px-4 py-2 font-semibold text-red-600 shadow-sm transition hover:bg-red-100"
              onClick={() => signOut(auth)}
              type="button"
            >
              Cerrar sesión
            </button>
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

        <div className="text-center py-8">
          <p className="text-slate-600">Admin panel loading...</p>
        </div>
      </main>
    </div>
  );
}
