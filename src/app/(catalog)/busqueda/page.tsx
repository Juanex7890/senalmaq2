import { Suspense } from 'react'
import { searchProducts } from '@/lib/actions/products'
import { getCategories } from '@/lib/actions/categories'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { SearchClient } from '@/components/catalog/search-client'
import { generateMetadata } from '@/lib/seo'
import { SearchFilters } from '@/lib/types'

interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

async function SearchContent({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolvedSearchParams = await searchParams
  const query = resolvedSearchParams.q as string
  const categories = await getCategories()

  if (!query) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header categories={categories} />
        
        <main className="py-12">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Búsqueda de productos
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Utiliza la barra de búsqueda para encontrar los productos que necesitas
              </p>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    )
  }

  // Parse search params
  const filters: SearchFilters = {
    minPrice: resolvedSearchParams.minPrice ? Number(resolvedSearchParams.minPrice) : undefined,
    maxPrice: resolvedSearchParams.maxPrice ? Number(resolvedSearchParams.maxPrice) : undefined,
    brand: resolvedSearchParams.brand as string,
    sortBy: (resolvedSearchParams.sortBy as any) || 'relevance',
    page: resolvedSearchParams.page ? Number(resolvedSearchParams.page) : 1,
    limit: 20,
  }

  const { products, pagination } = await searchProducts(query, filters, {
    page: filters.page || 1,
    limit: filters.limit || 20,
  })

  // Get unique brands for filter
  const brands = Array.from(new Set(products.map(p => p.brand).filter(Boolean))) as string[]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header categories={categories} />
      
      <main className="py-8">
        <div className="container mx-auto px-4">
          {/* Search Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Resultados de búsqueda
            </h1>
            <p className="text-lg text-gray-600">
              {pagination.total} {pagination.total === 1 ? 'resultado' : 'resultados'} para "{query}"
            </p>
          </div>

          <SearchClient
            initialProducts={products}
            initialPagination={pagination}
            initialFilters={filters}
            brands={brands}
            categories={categories}
            query={query}
          />
        </div>
      </main>

      <Footer />
    </div>
  )
}

export const metadata = generateMetadata({
  title: 'Búsqueda de productos',
  description: 'Busca entre nuestra amplia gama de máquinas de coser, fileteadoras, cortadoras y accesorios industriales.',
  keywords: 'búsqueda, máquinas de coser, fileteadoras, cortadoras, planchas, accesorios',
})

export default function SearchPage({ searchParams }: SearchPageProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <div className="animate-pulse">
          <div className="h-16 bg-gray-200"></div>
          <div className="container mx-auto px-4 py-8">
            <div className="h-12 bg-gray-200 rounded mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="h-96 bg-gray-200 rounded-2xl"></div>
              <div className="lg:col-span-3">
                <div className="h-8 bg-gray-200 rounded mb-6"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-64 bg-gray-200 rounded-2xl"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    }>
      <SearchContent searchParams={searchParams} />
    </Suspense>
  )
}
