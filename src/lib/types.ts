ï»¿export interface Category {
  id: string;
  name: string;
  icon: string;
  slug: string;
  // Legacy fields for compatibility
  description?: string;
  heroImagePath?: string;
  position?: number;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

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
  // Legacy fields for compatibility
  categoryName?: string;
  categorySlug?: string;
  imagePaths?: string[];
  specs?: { key: string; value: string }[];
  active?: boolean;
  isBestseller?: boolean;
  isFeatured?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  search?: string;
  compareAtPrice?: number;
  sku?: string;
}

export interface SiteMedia {
  heroHeadline: string
  heroSub: string
  youtubeMainId: string
  youtubeShortIds: string[]
  instagramUrl: string
  youtubeUrl: string
  tiktokUrl: string
  whatsappUrl: string
  heroImages?: string[]
}

export interface CartItem {
  productId: string
  quantity: number
  product?: Product
}

export interface User {
  uid: string
  email: string
  role?: string
}

export interface SearchFilters {
  categoryName?: string
  categorySlug?: string
  minPrice?: number
  maxPrice?: number
  brand?: string
  sortBy?: 'relevance' | 'price-asc' | 'price-desc' | 'newest'
  page?: number
  limit?: number
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}
