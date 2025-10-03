import { getProductsCollection, mapProductDocument } from './firebase'
import { query, orderBy, limit, getDocs } from 'firebase/firestore'
import { Product, SearchFilters, PaginationInfo } from './types'
import { generateSlug } from '@/lib/utils'

type CategoryFilterInput = {
  categoryId?: string
  categoryName?: string
  categorySlug?: string
}

const normalizeCategoryValue = (value?: string) =>
  typeof value === 'string' ? value.trim().toLowerCase() : ''

const buildCategoryCandidateSet = (values: CategoryFilterInput) => {
  const set = new Set<string>()
  const push = (value?: string) => {
    const normalized = normalizeCategoryValue(value)
    if (normalized) {
      set.add(normalized)
    }
  }

  push(values.categoryId)
  push(values.categorySlug)
  if (values.categoryName) {
    push(values.categoryName)
    push(generateSlug(values.categoryName))
  }

  return set
}

const buildProductCategorySet = (product: Product) => {
  const set = new Set<string>()
  const push = (value?: string) => {
    const normalized = normalizeCategoryValue(value)
    if (normalized) {
      set.add(normalized)
    }
  }

  push(product.categoryId)
  push(typeof product.category === 'string' ? product.category : undefined)
  push(product.categorySlug)
  if (product.categoryName) {
    push(product.categoryName)
    push(generateSlug(product.categoryName))
  }

  return set
}

const matchesCategoryFilter = (product: Product, filter: CategoryFilterInput) => {
  const targets = buildCategoryCandidateSet(filter)
  if (targets.size === 0) {
    return true
  }

  const productCandidates = buildProductCategorySet(product)
  for (const candidate of productCandidates) {
    if (targets.has(candidate)) {
      return true
    }
  }

  return false
}


export async function searchProducts(
  searchQuery: string,
  filters: SearchFilters = {},
  pagination: { page: number; limit: number } = { page: 1, limit: 20 }
): Promise<{ products: Product[]; pagination: PaginationInfo }> {
  try {
    // Get all products and filter client-side for now
    // In production, you'd want to implement proper Firestore search
    const productsRef = getProductsCollection();
    const q = query(productsRef, orderBy('name'));
    
    const snapshot = await getDocs(q);
    let allProducts = snapshot.docs
      .map((doc) => mapProductDocument(doc))
      .filter(Boolean) as Product[];

    // Apply search filter
    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase();
      allProducts = allProducts.filter((product) => {
        const description = (product.description || '').toLowerCase();
        const categoryText = (product.categoryName || product.category || '').toLowerCase();
        return (
          product.name.toLowerCase().includes(searchLower) ||
          description.includes(searchLower) ||
          categoryText.includes(searchLower)
        );
      });
    }

    // Apply category filter
    const categoryFilter: CategoryFilterInput = {
      categoryId: filters.categoryId,
      categoryName: filters.categoryName,
      categorySlug: filters.categorySlug,
    }

    if (
      categoryFilter.categoryId ||
      categoryFilter.categoryName ||
      categoryFilter.categorySlug
    ) {
      allProducts = allProducts.filter((product) =>
        matchesCategoryFilter(product, categoryFilter)
      )
    }

    // Apply price filters
    if (filters.minPrice !== undefined) {
      allProducts = allProducts.filter(product => product.price >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      allProducts = allProducts.filter(product => product.price <= filters.maxPrice!);
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'price-asc':
        allProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        allProducts.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        // Since we don't have createdAt in our current structure, sort by name
        allProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // Sort by bestseller first, then by name
        allProducts.sort((a, b) => {
          if (a.bestSeller && !b.bestSeller) return -1;
          if (!a.bestSeller && b.bestSeller) return 1;
          return a.name.localeCompare(b.name);
        });
    }

    // Apply pagination
    const total = allProducts.length;
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    const products = allProducts.slice(startIndex, endIndex);

    const totalPages = Math.ceil(total / pagination.limit);

    return {
      products,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages,
      },
    };
  } catch (error) {
    console.error('Error searching products:', error);
    return {
      products: [],
      pagination: {
        page: 1,
        limit: pagination.limit,
        total: 0,
        totalPages: 0,
      },
    };
  }
}

export async function getBestsellerProducts(limitCount: number = 8): Promise<Product[]> {
  try {
    const productsRef = getProductsCollection();
    const q = query(productsRef, orderBy('name'));
    
    const snapshot = await getDocs(q);
    const allProducts = snapshot.docs
      .map((doc) => mapProductDocument(doc))
      .filter(Boolean) as Product[];

    // Filter for bestsellers and limit
    return allProducts
      .filter(product => product.bestSeller)
      .slice(0, limitCount);
  } catch (error) {
    console.error('Error fetching bestseller products:', error);
    return [];
  }
}

export async function getFeaturedProducts(limitCount: number = 8): Promise<Product[]> {
  try {
    const productsRef = getProductsCollection();
    const q = query(productsRef, orderBy('name'));
    
    const snapshot = await getDocs(q);
    const allProducts = snapshot.docs
      .map((doc) => mapProductDocument(doc))
      .filter(Boolean) as Product[];

    // For now, return the first products as featured
    // In the future, you might add a 'featured' field to products
    return allProducts.slice(0, limitCount);
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
}
