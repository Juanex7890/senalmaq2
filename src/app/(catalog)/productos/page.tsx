import { getProductsWithPagination } from '@/lib/actions/products'
import { getCategories } from '@/lib/actions/categories'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ProductsClient } from '@/components/catalog/products-client'
import { generateMetadata } from '@/lib/seo'
import { SearchFilters } from '@/lib/types'

export const metadata = generateMetadata({
  title: 'Todos los Productos',
  description: 'Explora nuestro catA�logo completo de mA�quinas de coser, fileteadoras, cortadoras y accesorios industriales.',
  keywords: 'productos, mA�quinas de coser, fileteadoras, cortadoras, planchas, accesorios, catA�logo',
})

export const revalidate = 300

interface ProductsPageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const categories = await getCategories()

  const resolvedSearchParams = searchParams ? await searchParams : {}

  const categorySlugParam = resolvedSearchParams.categorySlug
  const categoryNameParam = resolvedSearchParams.categoryName
  const brandParam = resolvedSearchParams.brand
  const minPriceParam = resolvedSearchParams.minPrice
  const maxPriceParam = resolvedSearchParams.maxPrice
  const sortByParam = resolvedSearchParams.sortBy
  const pageParam = resolvedSearchParams.page
  const limitParam = resolvedSearchParams.limit

  const categorySlugValue = Array.isArray(categorySlugParam) ? categorySlugParam[0] : categorySlugParam
  const categoryNameValue = Array.isArray(categoryNameParam) ? categoryNameParam[0] : categoryNameParam
  const brandValue = Array.isArray(brandParam) ? brandParam[0] : brandParam
  const minPriceValue = Array.isArray(minPriceParam) ? minPriceParam[0] : minPriceParam
  const maxPriceValue = Array.isArray(maxPriceParam) ? maxPriceParam[0] : maxPriceParam
  const sortByValue = Array.isArray(sortByParam) ? sortByParam[0] : sortByParam
  const pageValue = Array.isArray(pageParam) ? pageParam[0] : pageParam
  const limitValue = Array.isArray(limitParam) ? limitParam[0] : limitParam

  let selectedCategory = categorySlugValue ? categories.find(cat => cat.slug === categorySlugValue) : undefined
  if (!selectedCategory && categoryNameValue) {
    const normalizedName = categoryNameValue.toLowerCase()
    selectedCategory = categories.find(cat => cat.name.toLowerCase() === normalizedName)
  }

  const filters: SearchFilters = {
    categorySlug: categorySlugValue || selectedCategory?.slug,
    categoryName: categoryNameValue || selectedCategory?.name,
    brand: brandValue || undefined,
    minPrice: minPriceValue ? Number(minPriceValue) : undefined,
    maxPrice: maxPriceValue ? Number(maxPriceValue) : undefined,
    sortBy: (sortByValue as any) || 'relevance',
  }

  const page = pageValue ? Number(pageValue) : 1
  const limit = limitValue ? Number(limitValue) : 24

  const { products, pagination } = await getProductsWithPagination(filters, {
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
              Todos los Productos
            </h1>
            <p className="text-lg text-gray-600">
              {pagination.total} {pagination.total === 1 ? 'producto' : 'productos'} disponibles
            </p>
          </div>

          <ProductsClient
            products={products}
            pagination={pagination}
            filters={filters}
            categories={categories}
            brands={brands}
          />
        </div>
      </main>

      <Footer />
    </div>
  )
}
