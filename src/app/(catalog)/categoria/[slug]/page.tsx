import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { getCategoryBySlug } from '@/lib/actions/categories'
import { getProductsWithPagination } from '@/lib/actions/products'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { CategoryClient } from '@/components/catalog/category-client'
import { generateCategoryMetadata } from '@/lib/seo'
import { SearchFilters } from '@/lib/types'
import { getCategories } from '@/lib/actions/categories'

interface CategoryPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

async function CategoryContent({ slug, searchParams }: { slug: string; searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolvedSearchParams = await searchParams
  const category = await getCategoryBySlug(slug)
  
  if (!category) {
    notFound()
  }

  const categoryNameParam = resolvedSearchParams.categoryName
  const categorySlugParam = resolvedSearchParams.categorySlug
  const minPriceParam = resolvedSearchParams.minPrice
  const maxPriceParam = resolvedSearchParams.maxPrice
  const brandParam = resolvedSearchParams.brand
  const sortByParam = resolvedSearchParams.sortBy
  const pageParam = resolvedSearchParams.page
  const limitParam = resolvedSearchParams.limit

  const categoryNameValue = Array.isArray(categoryNameParam) ? categoryNameParam[0] : categoryNameParam
  const categorySlugValue = Array.isArray(categorySlugParam) ? categorySlugParam[0] : categorySlugParam
  const minPriceValue = Array.isArray(minPriceParam) ? minPriceParam[0] : minPriceParam
  const maxPriceValue = Array.isArray(maxPriceParam) ? maxPriceParam[0] : maxPriceParam
  const brandValue = Array.isArray(brandParam) ? brandParam[0] : brandParam
  const sortByValue = Array.isArray(sortByParam) ? sortByParam[0] : sortByParam
  const pageValue = Array.isArray(pageParam) ? pageParam[0] : pageParam
  const limitValue = Array.isArray(limitParam) ? limitParam[0] : limitParam

  const filters: SearchFilters = {
    categoryName: categoryNameValue || category.name,
    categorySlug: categorySlugValue || category.slug,
    minPrice: minPriceValue ? Number(minPriceValue) : undefined,
    maxPrice: maxPriceValue ? Number(maxPriceValue) : undefined,
    brand: brandValue || undefined,
    sortBy: (sortByValue as any) || 'relevance',
    page: pageValue ? Number(pageValue) : 1,
    limit: limitValue ? Number(limitValue) : 20,
  }

  const { products, pagination } = await getProductsWithPagination(filters, {
    page: filters.page || 1,
    limit: filters.limit || 20,
  })

  // Get unique brands for filter
  const brands = Array.from(new Set(products.map(p => p.brand).filter(Boolean))) as string[]
  const categories = await getCategories()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header categories={categories} />
      
      <main className="py-8">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
            <a href="/" className="hover:text-primary-600">Inicio</a>
            <span>/</span>
            <a href="/categorias" className="hover:text-primary-600">CategorÃ­as</a>
            <span>/</span>
            <span className="text-gray-900">{category.name}</span>
          </nav>

          {/* Category Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-lg text-gray-600 max-w-3xl">
                {category.description}
              </p>
            )}
          </div>

          <CategoryClient
            products={products}
            pagination={pagination}
            filters={filters}
            brands={brands}
            category={category}
            categories={categories}
          />
        </div>
      </main>

      <Footer />
    </div>
  )
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const resolvedParams = await params
  const category = await getCategoryBySlug(resolvedParams.slug)
  
  if (!category) {
    return {
      title: 'CategorÃ­a no encontrada',
    }
  }

  return generateCategoryMetadata(category)
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const resolvedParams = await params
  
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <div className="animate-pulse">
          <div className="h-16 bg-gray-200"></div>
          <div className="container mx-auto px-4 py-8">
            <div className="h-8 bg-gray-200 rounded mb-8"></div>
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
      <CategoryContent slug={resolvedParams.slug} searchParams={searchParams} />
    </Suspense>
  )
}

