import { getCategories } from '@/lib/actions/categories'
import { getAllProducts, resolveCategoryForProduct } from '@/lib/actions/products'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { CategoryCard } from '@/components/catalog/category-card'
import { generateMetadata } from '@/lib/seo'
import { LayoutGrid } from 'lucide-react'

export const metadata = generateMetadata({
  title: 'Categorias de Productos',
  description: 'Explora todas nuestras categorias de maquinas de coser, fileteadoras, cortadoras y accesorios industriales.',
  keywords: 'categorias, maquinas de coser, fileteadoras, cortadoras, planchas, accesorios',
})

export const revalidate = 300

export default async function CategoriesPage() {
  const [categories, products] = await Promise.all([
    getCategories(),
    getAllProducts(),
  ])

  const productCounts = new Map<string, number>()
  for (const product of products) {
    const category = resolveCategoryForProduct(product, categories)
    if (category) {
      productCounts.set(category.id, (productCounts.get(category.id) ?? 0) + 1)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main>
        <div className="bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500 text-white">
          <div className="container mx-auto px-4 py-16 text-center">
            <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
              <LayoutGrid className="h-7 w-7" />
            </span>
            <h1 className="text-4xl md:text-5xl font-bold">
              Nuestras Categorías
            </h1>
            <p className="mt-4 text-lg text-primary-50 max-w-2xl mx-auto">
              Explora nuestra amplia gama de productos organizados por categoría.
              Encuentra exactamente lo que necesitas para tu taller o negocio.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {categories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categories.map((category, index) => (
                <div
                  key={category.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${Math.min(index, 8) * 60}ms`, animationFillMode: 'backwards' }}
                >
                  <CategoryCard
                    category={category}
                    productCount={productCounts.get(category.id) ?? 0}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No hay categorias disponibles
              </h3>
              <p className="text-gray-500">
                Pronto tendremos categorias disponibles para ti.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
