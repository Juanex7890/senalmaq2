'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProductCard } from '@/components/catalog/product-card'
import { Pagination } from '@/components/catalog/pagination'
import { Product, SearchFilters, PaginationInfo, Category } from '@/lib/types'

interface CategoryClientProps {
  products: Product[]
  pagination: PaginationInfo
  filters: SearchFilters
  brands: string[]
  category: Category
  categories: Category[]
}

export function CategoryClient({
  products,
  pagination,
  filters,
  brands,
  category,
  categories
}: CategoryClientProps) {
  const router = useRouter()
  const [isNavigating, setIsNavigating] = useState(false)

  const enrichFilters = (input: SearchFilters, override?: Category): SearchFilters => {
    const next = { ...input }
    const target =
      override ||
      (next.categoryId ? categories.find(cat => cat.id === next.categoryId) : undefined) ||
      category

    if (next.categoryId) {
      if (target) {
        next.categoryId = target.id
        next.categoryName = target.name
        next.categorySlug = target.slug
      }
    } else {
      delete next.categoryName
      delete next.categorySlug
    }

    return next
  }

  const buildUrl = (preparedFilters: SearchFilters, targetCategory?: Category) => {
    const params = new URLSearchParams()
    Object.entries(preparedFilters).forEach(([key, value]) => {
      if (
        value !== undefined &&
        value !== '' &&
        key !== 'categoryName' &&
        key !== 'categorySlug'
      ) {
        params.set(key, String(value))
      }
    })

    const queryString = params.toString()
    if (targetCategory) {
      return queryString
        ? `/categoria/${targetCategory.slug}?${queryString}`
        : `/categoria/${targetCategory.slug}`
    }

    if (!preparedFilters.categoryId || preparedFilters.categoryId === '') {
      return queryString ? `/productos?${queryString}` : '/productos'
    }

    return queryString ? `?${queryString}` : ''
  }

  const handleFiltersChange = (incomingFilters: SearchFilters) => {
    setIsNavigating(true)

    if (!incomingFilters.categoryId || incomingFilters.categoryId === '') {
      const prepared = enrichFilters(incomingFilters)
      const url = buildUrl(prepared)
      router.push(url || '/productos')
      return
    }

    if (incomingFilters.categoryId !== category.id) {
      const targetCategory = categories.find(cat => cat.id === incomingFilters.categoryId)
      if (targetCategory) {
        const prepared = enrichFilters(incomingFilters, targetCategory)
        const url = buildUrl(prepared, targetCategory)
        router.push(url || `/categoria/${targetCategory.slug}`)
        return
      }
    }

    const prepared = enrichFilters(incomingFilters, category)
    const url = buildUrl(prepared)
    router.push(url || `/categoria/${category.slug}`)
  }

  const handleSortChange = (sortBy: string) => {
    setIsNavigating(true)
    const prepared = enrichFilters({ ...filters, sortBy: sortBy as any }, category)
    const url = buildUrl(prepared)
    router.push(url || `/categoria/${category.slug}`)
  }

  const handlePageChange = (page: number) => {
    setIsNavigating(true)
    const prepared = enrichFilters({ ...filters, page }, category)
    const url = buildUrl(prepared)
    router.push(url || `/categoria/${category.slug}`)
  }

  return (
    <div className="relative">
      {/* Loading Overlay */}
      {isNavigating && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
          <div className="flex items-center space-x-2 text-primary-600">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-600 border-t-transparent"></div>
            <span className="text-sm font-medium">Cargando...</span>
          </div>
        </div>
      )}

      <div className="w-full">
        {/* Products Grid */}
        <div className="w-full">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-gray-600">
              {pagination.total} {pagination.total === 1 ? 'producto' : 'productos'} encontrados
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={filters.sortBy || 'relevance'}
              onChange={(e) => handleSortChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg transition-all duration-200 ease-in-out hover:border-gray-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:outline-none"
            >
              <option value="relevance">Relevancia</option>
              <option value="price-asc">Precio: menor a mayor</option>
              <option value="price-desc">Precio: mayor a menor</option>
              <option value="newest">Más recientes</option>
            </select>
          </div>
        </div>

        {/* Products */}
        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <Pagination
                pagination={pagination}
                onPageChange={handlePageChange}
              />
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl text-gray-300 mb-4">dY"?</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No se encontraron productos
            </h3>
            <p className="text-gray-500 mb-6">
              No hay productos en esta categoría que coincidan con los filtros seleccionados.
            </p>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
