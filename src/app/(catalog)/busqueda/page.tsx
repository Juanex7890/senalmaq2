import { searchProducts } from '@/lib/actions/products'
import { getCategories } from '@/lib/actions/categories'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { SearchClient } from '@/components/catalog/search-client'
import { generateMetadata } from '@/lib/seo'
import { SearchFilters } from '@/lib/types'

interface SearchPageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}

export const metadata = generateMetadata({
  title: 'BA�squeda de productos',
  description: 'Busca entre nuestra amplia gama de mA�quinas de coser, fileteadoras, cortadoras y accesorios industriales.',
  keywords: 'bA�squeda, mA�quinas de coser, fileteadoras, cortadoras, planchas, accesorios',
})

export const revalidate = 300

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const categories = await getCategories()
  const resolvedSearchParams = searchParams ? await searchParams : {}
  const queryParam = resolvedSearchParams.q
  const query = Array.isArray(queryParam) ? queryParam[0] : queryParam

  if (!query) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header categories={categories} />
        
        <main className="py-12">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                BA�squeda de productos
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Utiliza la barra de bA�squeda para encontrar los productos que necesitas
              </p>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    )
  }

  const minPriceParam = resolvedSearchParams.minPrice
  const maxPriceParam = resolvedSearchParams.maxPrice
  const brandParam = resolvedSearchParams.brand
  const sortByParam = resolvedSearchParams.sortBy
  const pageParam = resolvedSearchParams.page

  const minPriceValue = Array.isArray(minPriceParam) ? minPriceParam[0] : minPriceParam
  const maxPriceValue = Array.isArray(maxPriceParam) ? maxPriceParam[0] : maxPriceParam
  const brandValue = Array.isArray(brandParam) ? brandParam[0] : brandParam
  const sortByValue = Array.isArray(sortByParam) ? sortByParam[0] : sortByParam
  const pageValue = Array.isArray(pageParam) ? pageParam[0] : pageParam

  const page = pageValue ? Number(pageValue) : 1
  const limit = 20

  const filters: SearchFilters = {
    minPrice: minPriceValue ? Number(minPriceValue) : undefined,
    maxPrice: maxPriceValue ? Number(maxPriceValue) : undefined,
    brand: brandValue || undefined,
    sortBy: (sortByValue as any) || 'relevance',
    page,
    limit,
  }

  const { products, pagination } = await searchProducts(query, filters, {
    page,
    limit,
  })

  const brands = Array.from(new Set(products.map(p => p.brand).filter(Boolean))) as string[]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header categories={categories} />
      
      <main className="py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Resultados de bA�squeda
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
