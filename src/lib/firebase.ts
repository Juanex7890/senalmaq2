import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { Product } from "./types";
import {
  collection,
  doc,
  getFirestore,
  onSnapshot,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  DocumentSnapshot,
  QuerySnapshot,
  Unsubscribe,
  DocumentData,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  UploadResult,
} from "firebase/storage";
import {
  getAnalytics,
  isSupported as isAnalyticsSupported,
  Analytics,
} from "firebase/analytics";

import { generateSlug } from "@/lib/utils";

const firebaseConfig = {
  apiKey: "AIzaSyBi34J-Y5FoNhR48xdwk0saCvsyNJ4TJRM",
  authDomain: "senalmaq-68ae5.firebaseapp.com",
  projectId: "senalmaq-68ae5",
  storageBucket: "senalmaq-68ae5.firebasestorage.app",
  messagingSenderId: "643534078633",
  appId: "1:643534078633:web:016ae37a6aee2aef9a1fb8",
  measurementId: "G-18YHT6B0RQ",
};

const app = initializeApp(firebaseConfig);

let analytics: Analytics | null = null;
if (typeof window !== "undefined") {
  isAnalyticsSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    })
    .catch(() => {
      // analytics is optional; ignore failures in unsupported environments
    });
}

const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

const PRODUCTS_COLLECTION = "products";
const CATEGORIES_COLLECTION = "categories";
const SETTINGS_COLLECTION = "settings";
const SOCIAL_DOC_ID = "social";

const productsCollection = collection(db, PRODUCTS_COLLECTION);
const categoriesCollection = collection(db, CATEGORIES_COLLECTION);
const socialDocRef = doc(db, SETTINGS_COLLECTION, SOCIAL_DOC_ID);

const sanitizeString = (value: unknown, fallback = ""): string =>
  typeof value === "string" ? value.trim() : fallback;

const sanitizeBoolean = (value: unknown, fallback = false): boolean =>
  typeof value === "boolean" ? value : Boolean(value ?? fallback);

const sanitizeNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const sanitizeStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter((item) => item !== "");
};


export interface Category {
  id: string;
  name: string;
  icon: string;
  slug: string;
  description?: string;
  updatedAt?: Date;
}

export interface SocialData {
  instagram: string;
  youtube: string;
  tiktok: string;
  whatsapp: string;
  videoId: string;
  shorts: string[];
  heroImages: string[];
}

export const PRODUCT_DEFAULTS: Pick<
  Product,
  "bestSeller" | "images" | "imagePaths" | "active" | "consultRequired"
> & { price: number } = {
  bestSeller: false,
  images: [],
  imagePaths: [],
  price: 0,
  active: true,
  consultRequired: false,
};

export const SOCIAL_DEFAULTS: SocialData = {
  instagram: "",
  youtube: "",
  tiktok: "",
  whatsapp: "",
  videoId: "",
  shorts: [],
  heroImages: [],
};

export const CATEGORY_DEFAULTS: Pick<Category, "name" | "icon"> = {
  name: "",
  icon: "gear",
};

export function applyProductSchema(data: unknown = {}): Partial<Product> {
  const raw = typeof data === "object" && data !== null ? (data as Record<string, unknown>) : {};

  const name = sanitizeString(raw.name);
  const primaryImage = sanitizeString(raw.imageUrl) || sanitizeString(raw.image);
  const images = sanitizeStringArray(raw.images);
  const imagePaths = sanitizeStringArray(raw.imagePaths);
  const categoryName = sanitizeString(raw.categoryName) || sanitizeString(raw.category);
  const categorySlug = sanitizeString(raw.categorySlug);

  const resolvedCategorySlug = categorySlug || (categoryName ? generateSlug(categoryName) : "");
  const consultNote = sanitizeString(raw.consultNote);

  return {
    name,
    description: sanitizeString(raw.description),
    price: sanitizeNumber(raw.price, PRODUCT_DEFAULTS.price),
    category: sanitizeString(raw.category),
    categoryName: categoryName || undefined,
    categorySlug: resolvedCategorySlug || undefined,
    bestSeller: sanitizeBoolean(raw.bestSeller, PRODUCT_DEFAULTS.bestSeller),
    isBestseller: sanitizeBoolean((raw as Record<string, unknown>).isBestseller, false),
    isFeatured: sanitizeBoolean((raw as Record<string, unknown>).isFeatured, false),
    imageUrl: primaryImage,
    image: primaryImage,
    images,
    imagePaths,
    brand: sanitizeString(raw.brand) || undefined,
    slug: sanitizeString(raw.slug) || (name ? generateSlug(name) : undefined),
    sku: sanitizeString(raw.sku) || undefined,
    compareAtPrice: (() => {
      const value = sanitizeNumber(raw.compareAtPrice, NaN);
      return Number.isFinite(value) ? value : undefined;
    })(),
    consultRequired: sanitizeBoolean(raw.consultRequired, PRODUCT_DEFAULTS.consultRequired),
    consultNote: consultNote || undefined,
  };
}

export const getProductsCollection = () => productsCollection;
export const getProductDoc = (id: string) => doc(db, PRODUCTS_COLLECTION, id);

export function subscribeToProducts(
  onNext: (snapshot: QuerySnapshot<DocumentData>) => void,
  onError: (error: Error) => void
): Unsubscribe {
  return onSnapshot(productsCollection, onNext, onError);
}

export function mapProductDocument(document: DocumentSnapshot<DocumentData>): Product | null {
  if (!document.exists()) {
    return null;
  }

  const data = applyProductSchema(document.data());
  const docId = document.id;
  const legacyId = sanitizeString((document.data() as Record<string, unknown>)?.id);
  const images = data.images ?? PRODUCT_DEFAULTS.images;
  const imagePaths = data.imagePaths ?? PRODUCT_DEFAULTS.imagePaths;

  return {
    docId,
    id: legacyId || docId,
    name: data.name ?? "",
    price: data.price ?? PRODUCT_DEFAULTS.price,
    description: data.description ?? "",
    category: data.category ?? "",
    bestSeller: data.bestSeller ?? PRODUCT_DEFAULTS.bestSeller,
    imageUrl: data.imageUrl ?? "",
    image: data.image ?? "",
    images,
    imagePaths,
    brand: data.brand,
    slug: data.slug,
    sku: data.sku,
    categoryName: data.categoryName,
    categorySlug: data.categorySlug,
    compareAtPrice: data.compareAtPrice,
    isBestseller: data.isBestseller,
    isFeatured: data.isFeatured,
    active: data.active ?? PRODUCT_DEFAULTS.active,
    consultRequired: data.consultRequired ?? PRODUCT_DEFAULTS.consultRequired,
    consultNote: data.consultNote,
  };
}

export function applyCategorySchema(data: unknown = {}): Partial<Category> {
  const raw = typeof data === "object" && data !== null ? (data as Record<string, unknown>) : {};

  const name = sanitizeString(raw.name) || CATEGORY_DEFAULTS.name;
  const slugFromData = sanitizeString(raw.slug);
  const slug = slugFromData || generateSlug(name);

  return {
    name,
    icon: sanitizeString(raw.icon) || CATEGORY_DEFAULTS.icon,
    slug,
    description: sanitizeString(raw.description) || undefined,
  };
}

export function mapCategoryDocument(document: DocumentSnapshot<DocumentData>): Category | null {
  if (!document.exists()) {
    return null;
  }

  const data = applyCategorySchema(document.data());
  return {
    id: document.id,
    name: data.name ?? CATEGORY_DEFAULTS.name,
    icon: data.icon ?? CATEGORY_DEFAULTS.icon,
    slug: data.slug ?? generateSlug(document.id),
    description: data.description,
  };
}

export const getCategoriesCollection = () => categoriesCollection;
export const getCategoryDoc = (id: string) => doc(db, CATEGORIES_COLLECTION, id);

export function subscribeToCategories(
  onNext: (snapshot: QuerySnapshot<DocumentData>) => void,
  onError: (error: Error) => void
): Unsubscribe {
  return onSnapshot(categoriesCollection, onNext, onError);
}

export const getSocialDoc = () => socialDocRef;

export function subscribeToSocial(
  onNext: (snapshot: DocumentSnapshot<DocumentData>) => void,
  onError: (error: Error) => void
): Unsubscribe {
  return onSnapshot(socialDocRef, onNext, onError);
}

export function applySocialSchema(data: unknown = {}): SocialData {
  const raw = typeof data === "object" && data !== null ? (data as Record<string, unknown>) : {};
  const base = {
    ...SOCIAL_DEFAULTS,
    ...raw,
  };

  const shorts = sanitizeStringArray(base.shorts);
  const heroImages = sanitizeStringArray(base.heroImages);

  return {
    instagram: sanitizeString(base.instagram),
    youtube: sanitizeString(base.youtube),
    tiktok: sanitizeString(base.tiktok),
    whatsapp: sanitizeString(base.whatsapp),
    videoId: sanitizeString(base.videoId),
    shorts,
    heroImages,
  };
}

export function mapSocialDocument(snapshot: DocumentSnapshot<DocumentData>): SocialData {
  if (!snapshot.exists()) {
    return { ...SOCIAL_DEFAULTS };
  }
  return applySocialSchema(snapshot.data());
}

export async function saveSocialData(data: Partial<SocialData> = {}): Promise<SocialData> {
  const payload = applySocialSchema({ ...SOCIAL_DEFAULTS, ...data });
  await setDoc(socialDocRef, payload, { merge: true });
  return payload;
}

export const getProductImageRef = (docId: string, fileName: string) =>
  ref(storage, `products/${docId}/${fileName}`);

export async function uploadProductImage(
  docId: string,
  file: File
): Promise<{ url: string; path: string }> {
  if (!docId || !file) {
    throw new Error("A document ID and file are required to upload an image.");
  }

  const originalName = typeof file.name === "string" ? file.name : "image";
  const safeName = originalName
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9_.-]/g, "");
  const fileName = `${Date.now()}-${safeName || "image"}`;
  const storageRef = getProductImageRef(docId, fileName);
  const metadata = file.type ? { contentType: file.type } : undefined;
  const snapshot: UploadResult = await uploadBytes(storageRef, file, metadata);
  const url = await getDownloadURL(snapshot.ref);
  return { url, path: snapshot.ref.fullPath };
}

export function getDownloadUrlForPath(path: string): Promise<string> {
  if (!path) {
    throw new Error("A storage path is required to get a download URL.");
  }
  return getDownloadURL(ref(storage, path));
}

export {
  app,
  auth,
  db,
  storage,
  analytics,
  addDoc,
  updateDoc,
  deleteDoc,
};


