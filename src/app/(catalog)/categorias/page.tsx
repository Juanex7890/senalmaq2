import { getCategories } from '@/lib/actions/categories'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { CategoryCard } from '@/components/catalog/category-card'
import { generateMetadata } from '@/lib/seo'

export const metadata = generateMetadata({
  title: 'Categorias de Productos',
  description: 'Explora todas nuestras categorias de maquinas de coser, fileteadoras, cortadoras y accesorios industriales.',
  keywords: 'categorias, maquinas de coser, fileteadoras, cortadoras, planchas, accesorios',
})

export const revalidate = 300

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header categories={categories} />
      
      <main className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Nuestras Categoris
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explora nuestra amplia gama de productos organizados por categorias. 
              Encuentra exactamente lo que necesitas para tu taller o negocio.
            </p>
          </div>

          {categories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl text-gray-300 mb-4"></div>
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
