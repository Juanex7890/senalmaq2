'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ProductCard } from '@/components/catalog/product-card'
import { Pagination } from '@/components/catalog/pagination'
import { Product, SearchFilters, PaginationInfo, Category } from '@/lib/types'

interface SearchClientProps {
  initialProducts: Product[]
  initialPagination: PaginationInfo
  initialFilters: SearchFilters
  brands: string[]
  categories: Category[]
  query: string
  whatsappUrl?: string | null
}

export function SearchClient({
  initialProducts,
  initialPagination,
  initialFilters,
  brands,
  categories,
  query,
  whatsappUrl,
}: SearchClientProps) {
  const [products, setProducts] = useState(initialProducts)
  const [pagination, setPagination] = useState(initialPagination)
  const [filters, setFilters] = useState(initialFilters)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    setProducts(initialProducts)
    setPagination(initialPagination)
    setFilters(initialFilters)
  }, [initialProducts, initialPagination, initialFilters])

  const handleFiltersChange = (newFilters: SearchFilters) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.set(key, String(value))
      } else {
        params.delete(key)
      }
    })
    router.push(`?${params.toString()}`)
  }

  const handleSortChange = (sortBy: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sortBy', sortBy)
    router.push(`?${params.toString()}`)
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(page))
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="w-full">
      {/* Results */}
      <div className="w-full">
        {/* Sort Options */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-gray-600">
              Mostrando {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} resultados
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
            <div className="text-6xl text-gray-300 mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No se encontraron productos
            </h3>
            <p className="text-gray-500 mb-6">
              No hay productos que coincidan con tu búsqueda "{query}".
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <p>Intenta:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Verificar la ortografía</li>
                <li>Usar términos más generales</li>
                <li>Probar con sinónimos</li>
                <li>Reducir el número de filtros</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
