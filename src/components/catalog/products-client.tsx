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
  whatsappUrl?: string | null
}

export function ProductsClient({
  products,
  pagination,
  filters,
  categories,
  brands,
  whatsappUrl,
}: ProductsClientProps) {
  const router = useRouter()
  const [isNavigating, setIsNavigating] = useState(false)

  const enrichFilters = (input: SearchFilters, override?: Category): SearchFilters => {
    const next: SearchFilters = { ...input }
    const target = override || (next.categorySlug ? categories.find((cat) => cat.slug === next.categorySlug) : undefined)

    if (target) {
      next.categorySlug = target.slug
      next.categoryName = target.name
    } else {
      delete next.categorySlug
      delete next.categoryName
    }

    return next
  }

  const sanitizeParams = (preparedFilters: SearchFilters, options: { excludeCategorySlug?: boolean } = {}) => {
    const params = new URLSearchParams()
    Object.entries(preparedFilters).forEach(([key, value]) => {
      if (
        value !== undefined &&
        value !== '' &&
        key !== 'categoryName' &&
        (!(options.excludeCategorySlug) || key !== 'categorySlug')
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

  const pushToCategory = (targetCategory: Category, prepared: SearchFilters) => {
    const params = sanitizeParams(prepared, { excludeCategorySlug: true })
    const queryString = params.toString()
    router.push(
      queryString
        ? `/categoria/${targetCategory.slug}?${queryString}`
        : `/categoria/${targetCategory.slug}`
    )
  }

  const handleFiltersChange = (incomingFilters: SearchFilters) => {
    setIsNavigating(true)

    if (incomingFilters.categorySlug) {
      const targetCategory = categories.find((cat) => cat.slug === incomingFilters.categorySlug)
      if (targetCategory) {
        const prepared = enrichFilters(incomingFilters, targetCategory)
        pushToCategory(targetCategory, prepared)
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

    if (prepared.categorySlug) {
      const targetCategory = categories.find((cat) => cat.slug === prepared.categorySlug)
      if (targetCategory) {
        pushToCategory(targetCategory, prepared)
        return
      }
    }

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
                  <ProductCard key={product.id} product={product} whatsappUrl={whatsappUrl} />
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
              <div className="text-6xl text-gray-300 mb-4">:(</div>
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
