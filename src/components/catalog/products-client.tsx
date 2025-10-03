'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProductCard } from '@/components/catalog/product-card'
import { Pagination } from '@/components/catalog/pagination'
import { Product, SearchFilters, PaginationInfo, Category } from '@/lib/types'

interface ProductsClientProps {
  products: Product[]
  pagination: PaginationInfo
  filters: SearchFilters
  categories: Category[]
  brands: string[]
}

export function ProductsClient({
  products,
  pagination,
  filters,
  categories,
  brands
}: ProductsClientProps) {
  const router = useRouter()
  const [isNavigating, setIsNavigating] = useState(false)

  const enrichFilters = (input: SearchFilters, override?: Category): SearchFilters => {
    const next = { ...input }
    const target = override || (next.categoryId ? categories.find(cat => cat.id === next.categoryId) : undefined)

    if (next.categoryId && target) {
      next.categoryId = target.id
      next.categoryName = target.name
      next.categorySlug = target.slug
    } else if (!next.categoryId) {
      delete next.categoryName
      delete next.categorySlug
    }

    return next
  }

  const sanitizeParams = (preparedFilters: SearchFilters, options: { excludeCategoryId?: boolean } = {}) => {
    const params = new URLSearchParams()
    Object.entries(preparedFilters).forEach(([key, value]) => {
      if (
        value !== undefined &&
        value !== '' &&
        key !== 'categoryName' &&
        key !== 'categorySlug' &&
        (!options.excludeCategoryId || key !== 'categoryId')
      ) {
        params.set(key, String(value))
      }
    })
    return params
  }

  const buildUrl = (preparedFilters: SearchFilters) => {
    const params = sanitizeParams(preparedFilters)
    const queryString = params.toString()
    return queryString ? `?${queryString}` : ''
  }

  const handleFiltersChange = (incomingFilters: SearchFilters) => {
    setIsNavigating(true)

    if (incomingFilters.categoryId) {
      const targetCategory = categories.find(cat => cat.id === incomingFilters.categoryId)
      if (targetCategory) {
        const prepared = enrichFilters(incomingFilters, targetCategory)
        const params = sanitizeParams(prepared, { excludeCategoryId: true })
        const queryString = params.toString()
        router.push(
          queryString
            ? `/categoria/${targetCategory.slug}?${queryString}`
            : `/categoria/${targetCategory.slug}`
        )
        return
      }
    }

    const prepared = enrichFilters(incomingFilters)
    const url = buildUrl(prepared)
    router.push(url || '/productos')
  }

  const handlePageChange = (page: number) => {
    setIsNavigating(true)
    const prepared = enrichFilters({ ...filters, page })
    const url = buildUrl(prepared)
    router.push(url || '/productos')
  }

  const handleClearFilters = () => {
    setIsNavigating(true)
    router.push('/productos')
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
              Intenta ajustar los filtros para encontrar lo que buscas.
            </p>
            <button
              onClick={handleClearFilters}
              className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
