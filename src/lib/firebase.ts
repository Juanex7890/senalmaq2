import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
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
const productsCollection = collection(db, PRODUCTS_COLLECTION);

const SETTINGS_COLLECTION = "settings";
const SOCIAL_DOC_ID = "social";
const socialDocRef = doc(db, SETTINGS_COLLECTION, SOCIAL_DOC_ID);

const CATEGORIES_COLLECTION = "categories";
const categoriesCollection = collection(db, CATEGORIES_COLLECTION);

export interface Product {
  docId: string;
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  bestSeller: boolean;
  imageUrl: string;
  image: string;
  images: string[];
  brand?: string;
  slug?: string;
  sku?: string;
  categoryId?: string;
  categoryName?: string;
  categorySlug?: string;
  imagePaths?: string[];
  compareAtPrice?: number;
  isBestseller?: boolean;
  isFeatured?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

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
  videoId: string;
  shorts: string[];
  heroImages: string[];
}

const PRODUCT_DEFAULTS = {
  bestSeller: false,
};

const SOCIAL_DEFAULTS: SocialData = {
  instagram: "",
  youtube: "",
  tiktok: "",
  videoId: "",
  shorts: [],
  heroImages: [],
};

const CATEGORY_DEFAULTS = {
  name: "",
  icon: "gear",
};

export function applyProductSchema(data: any = {}): Partial<Product> {
  const raw = typeof data === "object" && data !== null ? data : {};
  const merged = {
    ...PRODUCT_DEFAULTS,
    ...raw,
  };

  return {
    ...merged,
    bestSeller: Boolean(merged.bestSeller),
  };
}

export const getProductsCollection = () => productsCollection;
export const getProductDoc = (id: string) => doc(db, PRODUCTS_COLLECTION, id);

export function subscribeToProducts(
  onNext: (snapshot: QuerySnapshot) => void,
  onError: (error: Error) => void
): Unsubscribe {
  return onSnapshot(productsCollection, onNext, onError);
}

export function mapProductDocument(document: DocumentSnapshot): Product | null {
  if (!document) {
    return null;
  }

  const data = applyProductSchema(document.data());
  const legacyId = typeof data?.id === "string" ? data.id : undefined;
  const name = typeof data?.name === "string" ? data.name.trim() : "";

  const rawCategoryId = typeof (data as any)?.categoryId === "string" ? (data as any).categoryId.trim() : "";
  const rawCategory = typeof (data as any)?.category === "string" ? (data as any).category.trim() : "";
  const rawCategoryName = typeof (data as any)?.categoryName === "string" ? (data as any).categoryName.trim() : "";
  const categoryId = rawCategoryId || "";
  const categoryName = rawCategoryName || rawCategory;
  const categoryValue = categoryId || rawCategory;
  const categorySlug =
    typeof (data as any)?.categorySlug === "string"
      ? (data as any).categorySlug.trim()
      : categoryName
          ? generateSlug(categoryName)
          : rawCategory
          ? generateSlug(rawCategory)
          : "";

  const rawSlug = typeof (data as any)?.slug === "string" ? (data as any).slug.trim() : "";
  const slug = rawSlug || name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();

  const imageUrlValue = typeof data?.imageUrl === "string" ? data.imageUrl.trim() : "";
  const imageFallback = typeof (data as any)?.image === "string" ? (data as any).image.trim() : "";
  const imageUrl = imageUrlValue || imageFallback;

  const images = Array.isArray((data as any)?.images)
    ? ((data as any).images as any[])
        .map((value) => (typeof value === "string" ? value.trim() : ""))
        .filter((value) => value !== "")
    : [];

  const imagePaths = Array.isArray((data as any)?.imagePaths)
    ? ((data as any).imagePaths as any[])
        .map((value) => (typeof value === "string" ? value.trim() : ""))
        .filter((value) => value !== "")
    : images;

  const compareAtPriceRaw = (data as any)?.compareAtPrice;
  const compareAtPrice = typeof compareAtPriceRaw === "number"
    ? compareAtPriceRaw
    : Number(compareAtPriceRaw) || undefined;

  return {
    ...data,
    docId: document.id,
    id: legacyId ?? document.id,
    name,
    slug,
    price: Number((data as any)?.price) || 0,
    description: typeof data?.description === "string" ? data.description : "",
    category: categoryValue,
    categoryId: categoryId || undefined,
    categoryName: categoryName || undefined,
    categorySlug: categorySlug || undefined,
    bestSeller: Boolean(data?.bestSeller),
    isBestseller: Boolean((data as any)?.isBestseller ?? data?.bestSeller),
    imageUrl,
    image: imageUrl,
    images,
    imagePaths,
    compareAtPrice,
  } as Product;
}

export function applySocialSchema(data: any = {}): SocialData {
  const raw = typeof data === "object" && data !== null ? data : {};
  const base = {
    ...SOCIAL_DEFAULTS,
    ...raw,
  };
  const shorts = Array.isArray(base.shorts)
    ? base.shorts
        .map((value: any) => (typeof value === "string" ? value.trim() : ""))
        .filter((value: string) => value !== "")
    : [];

  const heroImages = Array.isArray(base.heroImages)
    ? base.heroImages
        .map((value: any) => (typeof value === "string" ? value.trim() : ""))
        .filter((value: string) => value !== "")
    : [];

  return {
    ...SOCIAL_DEFAULTS,
    ...raw,
    instagram: typeof base.instagram === "string" ? base.instagram.trim() : "",
    youtube: typeof base.youtube === "string" ? base.youtube.trim() : "",
    tiktok: typeof base.tiktok === "string" ? base.tiktok.trim() : "",
    videoId: typeof base.videoId === "string" ? base.videoId.trim() : "",
    shorts,
    heroImages,
  };
}

export function mapSocialDocument(snapshot: DocumentSnapshot): SocialData {
  if (!snapshot || !snapshot.exists()) {
    return { ...SOCIAL_DEFAULTS };
  }
  return applySocialSchema(snapshot.data());
}

export const getSocialDoc = () => socialDocRef;

export function subscribeToSocial(
  onNext: (snapshot: DocumentSnapshot) => void,
  onError: (error: Error) => void
): Unsubscribe {
  return onSnapshot(socialDocRef, onNext, onError);
}

export async function saveSocialData(data: Partial<SocialData> = {}): Promise<SocialData> {
  const payload = applySocialSchema(data);
  await setDoc(socialDocRef, payload, { merge: true });
  return payload;
}

export function applyCategorySchema(data: any = {}): Partial<Category> {
  const raw = typeof data === "object" && data !== null ? data : {};
  return {
    ...CATEGORY_DEFAULTS,
    ...raw,
    name: typeof raw.name === "string" ? raw.name.trim() : "",
    icon: typeof raw.icon === "string" ? raw.icon.trim() : CATEGORY_DEFAULTS.icon,
  };
}

export function mapCategoryDocument(document: DocumentSnapshot): Category | null {
  if (!document) {
    return null;
  }
  const data = applyCategorySchema(document.data());
  const name = data.name || "";
  // Use stored slug if available, otherwise generate from name
  const slug = data.slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  
  return {
    ...data,
    id: document.id,
    slug,
  } as Category;
}

export const getCategoriesCollection = () => categoriesCollection;
export const getCategoryDoc = (id: string) => doc(db, CATEGORIES_COLLECTION, id);

export function subscribeToCategories(
  onNext: (snapshot: QuerySnapshot) => void,
  onError: (error: Error) => void
): Unsubscribe {
  return onSnapshot(categoriesCollection, onNext, onError);
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

export { app, auth, db, storage, analytics, SOCIAL_DEFAULTS, CATEGORY_DEFAULTS };






