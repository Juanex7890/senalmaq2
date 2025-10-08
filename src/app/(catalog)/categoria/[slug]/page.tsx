import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCategoryBySlug, getCategories } from '@/lib/actions/categories'
import { getProductsWithPagination } from '@/lib/actions/products'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { CategoryClient } from '@/components/catalog/category-client'
import { generateCategoryMetadata } from '@/lib/seo'
import { SearchFilters } from '@/lib/types'

export const revalidate = 300

interface CategoryPageProps {
  params: Promise<{ slug: string }>
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params
  const category = await getCategoryBySlug(resolvedParams.slug)

  if (!category) {
    return {
      title: 'CategorA-a no encontrada',
    }
  }

  return generateCategoryMetadata(category)
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const resolvedParams = await params
  const resolvedSearchParams = searchParams ? await searchParams : {}
  const category = await getCategoryBySlug(resolvedParams.slug)

  if (!category) {
    notFound()
  }

  const categories = await getCategories()

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

  const page = pageValue ? Number(pageValue) : 1
  const limit = limitValue ? Number(limitValue) : 20

  const filters: SearchFilters = {
    categoryName: categoryNameValue || category.name,
    categorySlug: categorySlugValue || category.slug,
    minPrice: minPriceValue ? Number(minPriceValue) : undefined,
    maxPrice: maxPriceValue ? Number(maxPriceValue) : undefined,
    brand: brandValue || undefined,
    sortBy: (sortByValue as any) || 'relevance',
    page,
    limit,
  }

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
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
            <Link href="/" className="hover:text-primary-600">Inicio</Link>
            <span>/</span>
            <Link href="/categorias" className="hover:text-primary-600">CategorA-as</Link>
            <span>/</span>
            <span className="text-gray-900">{category.name}</span>
          </nav>

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
