import { 
  getProductsCollection, 
  mapProductDocument, 
  Product 
} from '@/lib/firebase';
import { query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { generateSlug } from '@/lib/utils';

type CategoryFilterInput = {
  categoryId?: string;
  categoryName?: string;
  categorySlug?: string;
};

const normalizeCategoryValue = (value?: string): string =>
  typeof value === 'string' ? value.trim().toLowerCase() : '';

const buildCategoryCandidateSet = (values: CategoryFilterInput): Set<string> => {
  const set = new Set<string>();
  const push = (value?: string) => {
    const normalized = normalizeCategoryValue(value);
    if (normalized) {
      set.add(normalized);
    }
  };

  push(values.categoryId);
  push(values.categorySlug);
  if (values.categoryName) {
    push(values.categoryName);
    push(generateSlug(values.categoryName));
  }

  return set;
};

const buildProductCategorySet = (product: Product): Set<string> => {
  const set = new Set<string>();
  const push = (value?: string) => {
    const normalized = normalizeCategoryValue(value);
    if (normalized) {
      set.add(normalized);
    }
  };

  push(product.categoryId);
  push(typeof product.category === 'string' ? product.category : undefined);
  push(product.categorySlug);
  if (product.categoryName) {
    push(product.categoryName);
    push(generateSlug(product.categoryName));
  }

  return set;
};

const matchesCategoryFilter = (
  product: Product,
  filter: CategoryFilterInput
): boolean => {
  const targets = buildCategoryCandidateSet(filter);
  if (targets.size === 0) {
    return true;
  }
  const productCandidates = buildProductCategorySet(product);
  for (const candidate of productCandidates) {
    if (targets.has(candidate)) {
      return true;
    }
  }
  return false;
};



export async function getBestsellerProducts(count: number = 8): Promise<Product[]> {
  try {
    const productsRef = getProductsCollection();
    const q = query(
      productsRef,
      where('bestSeller', '==', true),
      orderBy('name'),
      limit(count)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs
      .map((doc) => mapProductDocument(doc))
      .filter(Boolean) as Product[];
  } catch (error) {
    console.error('Error fetching bestseller products:', error);
    return [];
  }
}

export async function getFeaturedProducts(count: number = 8): Promise<Product[]> {
  try {
    const productsRef = getProductsCollection();
    const q = query(
      productsRef,
      orderBy('name'),
      limit(count)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs
      .map((doc) => mapProductDocument(doc))
      .filter(Boolean) as Product[];
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
}

export async function getAllProducts(): Promise<Product[]> {
  try {
    const productsRef = getProductsCollection();
    const q = query(productsRef, orderBy('name'));
    
    const snapshot = await getDocs(q);
    return snapshot.docs
      .map((doc) => mapProductDocument(doc))
      .filter(Boolean) as Product[];
  } catch (error) {
    console.error('Error fetching all products:', error);
    return [];
  }
}

export async function getProductsByCategory(
  categoryIdentifier: string,
  options: { categoryName?: string; categorySlug?: string } = {}
): Promise<Product[]> {
  try {
    const allProducts = await getAllProducts();
    const categoryFilter: CategoryFilterInput = {
      categoryId: categoryIdentifier,
      categoryName: options.categoryName,
      categorySlug: options.categorySlug,
    };

    return allProducts.filter((product) => matchesCategoryFilter(product, categoryFilter));
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }
}

export async function searchProducts(
  searchQuery: string,
  filters: any = {},
  pagination: { page: number; limit: number } = { page: 1, limit: 20 }
): Promise<{ products: Product[]; pagination: any }> {
  try {
    // Get all products and filter client-side for now
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
    };

    if (
      categoryFilter.categoryId ||
      categoryFilter.categoryName ||
      categoryFilter.categorySlug
    ) {
      allProducts = allProducts.filter((product) =>
        matchesCategoryFilter(product, categoryFilter)
      );
    }

    // Apply price filters
    if (filters.minPrice !== undefined) {
      allProducts = allProducts.filter(product => product.price >= filters.minPrice);
    }
    if (filters.maxPrice !== undefined) {
      allProducts = allProducts.filter(product => product.price <= filters.maxPrice);
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
        allProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
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

// Alias for getProducts to match existing imports
export const getProducts = getAllProducts;

// Function that returns products with pagination for category pages
export async function getProductsWithPagination(
  filters: any = {},
  pagination: { page: number; limit: number } = { page: 1, limit: 20 }
): Promise<{ products: Product[]; pagination: any }> {
  try {
    const allProducts = await getAllProducts();

    // Debug logging
    console.log('dY"? getProductsWithPagination Debug:');
    console.log('  - Total products:', allProducts.length);
    console.log('  - Filter categoryId:', filters.categoryId);
    console.log('  - Filter categoryName:', filters.categoryName);
    console.log('  - Filter categorySlug:', filters.categorySlug);
    console.log('  - Sample product categories:', allProducts.slice(0, 3).map(p => ({
      name: p.name,
      categoryId: p.categoryId || p.category,
      categoryName: p.categoryName,
      categorySlug: p.categorySlug,
    })));

    // Apply category filter
    let filteredProducts = allProducts;
    const categoryFilter: CategoryFilterInput = {
      categoryId: filters.categoryId,
      categoryName: filters.categoryName,
      categorySlug: filters.categorySlug,
    };

    if (
      categoryFilter.categoryId ||
      categoryFilter.categoryName ||
      categoryFilter.categorySlug
    ) {
      filteredProducts = allProducts.filter((product) =>
        matchesCategoryFilter(product, categoryFilter)
      );
      console.log('  - Products after category filter:', filteredProducts.length);
    }

    // Apply price filters
    
    if (filters.minPrice !== undefined) {
      filteredProducts = filteredProducts.filter(product => product.price >= filters.minPrice);
    }
    if (filters.maxPrice !== undefined) {
      filteredProducts = filteredProducts.filter(product => product.price <= filters.maxPrice);
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'price-asc':
        filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        filteredProducts.sort((a, b) => {
          if (a.bestSeller && !b.bestSeller) return -1;
          if (!a.bestSeller && b.bestSeller) return 1;
          return a.name.localeCompare(b.name);
        });
    }

    // Apply pagination
    const total = filteredProducts.length;
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    const products = filteredProducts.slice(startIndex, endIndex);

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
    console.error('Error fetching products with pagination:', error);
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

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const products = await getAllProducts();
    const normalizedSlug = slug.toLowerCase();
    return (
      products.find((product) => {
        const productSlug = (product.slug || '').toLowerCase();
        if (productSlug) {
          return productSlug === normalizedSlug;
        }
        const fallbackSlug = product.name
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\\u0300-\\u036f]/g, '')
          .replace(/[^a-z0-9\\s-]/g, '')
          .replace(/\\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();
        return fallbackSlug === normalizedSlug;
      }) || null
    );
  } catch (error) {
    console.error('Error fetching product by slug:', error);
    return null;
  }
}


