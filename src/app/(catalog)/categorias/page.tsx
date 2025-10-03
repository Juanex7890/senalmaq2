import { Suspense } from 'react'
import { getCategories } from '@/lib/actions/categories'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { CategoryCard } from '@/components/catalog/category-card'
import { generateMetadata } from '@/lib/seo'

export const metadata = generateMetadata({
  title: 'Categorías de Productos',
  description: 'Explora todas nuestras categorías de máquinas de coser, fileteadoras, cortadoras y accesorios industriales.',
  keywords: 'categorías, máquinas de coser, fileteadoras, cortadoras, planchas, accesorios',
})

async function CategoriesContent() {
  const categories = await getCategories()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header categories={categories} />
      
      <main className="py-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Nuestras Categorías
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explora nuestra amplia gama de productos organizados por categorías. 
              Encuentra exactamente lo que necesitas para tu taller o negocio.
            </p>
          </div>

          {/* Categories Grid */}
          {categories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl text-gray-300 mb-4">📦</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No hay categorías disponibles
              </h3>
              <p className="text-gray-500">
                Pronto tendremos categorías disponibles para ti.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function CategoriesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <div className="animate-pulse">
          <div className="h-16 bg-gray-200"></div>
          <div className="container mx-auto px-4 py-12">
            <div className="text-center mb-12">
              <div className="h-12 bg-gray-200 rounded mb-4"></div>
              <div className="h-6 bg-gray-200 rounded max-w-2xl mx-auto"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    }>
      <CategoriesContent />
    </Suspense>
  )
}
