import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { getProductBySlug, getProductsWithPagination, resolveCategoryForProduct } from '@/lib/actions/products'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Gallery } from '@/components/product/gallery'
import { SpecsTable } from '@/components/product/specs-table'
import { BuyButtonsClient } from '@/components/product/buy-buttons-client'
import { ProductCardServer } from '@/components/catalog/product-card-server'
import { generateProductMetadata, generateProductJsonLd, generateBreadcrumbJsonLd } from '@/lib/seo'
import { getCategories } from '@/lib/actions/categories'

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

async function ProductContent({ slug }: { slug: string }) {
  const product = await getProductBySlug(slug)
  
  if (!product) {
    notFound()
  }

  const categories = await getCategories()
  const category = resolveCategoryForProduct(product, categories)

  // Get related products (same category, excluding current product)
  const { products: relatedProducts } = await getProductsWithPagination(
    {
      categorySlug: product.categorySlug || category?.slug,
      categoryName:
        product.categoryName ||
        (typeof product.category === 'string' ? product.category : undefined) ||
        category?.name,
    },
    { page: 1, limit: 4 }
  )
  const filteredRelated = relatedProducts.filter(p => p.id !== product.id).slice(0, 4)

  const breadcrumbItems = [
    { name: 'Inicio', url: '/' },
    { name: 'CategorÃ­as', url: '/categorias' },
    ...(category ? [{ name: category.name, url: `/categoria/${category.slug}` }] : []),
    { name: product.name, url: `/producto/${product.name.toLowerCase().replace(/\s+/g, '-')}` },
  ]

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
            {category && (
              <>
                <span>/</span>
                <a href={`/categoria/${category.slug}`} className="hover:text-primary-600">
                  {category.name}
                </a>
              </>
            )}
            <span>/</span>
            <span className="text-gray-900">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Product Gallery */}
            <div>
              <Gallery images={product.images} productName={product.name} />
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {product.name}
                </h1>
                {product.brand && (
                  <p className="text-lg text-gray-600 mb-2">{product.brand}</p>
                )}
                {product.sku && (
                  <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                )}
              </div>

              <div className="prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: product.description }} />
              </div>

              <BuyButtonsClient 
                product={product} 
              />
            </div>
          </div>

          {/* Product Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {/* Specifications */}
            <div className="lg:col-span-2">
              <SpecsTable product={product} />
            </div>

            {/* Additional Info */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  InformaciÃ³n del producto
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Marca:</span>
                    <span className="font-medium">{product.brand || 'No especificada'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">SKU:</span>
                    <span className="font-medium">{product.sku || 'No disponible'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">CategorÃ­a:</span>
                    <span className="font-medium">
                      {
                        category?.name ||
                        product.categoryName ||
                        (typeof product.category === 'string' ? product.category : 'Sin categorÃ­a')
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estado:</span>
                    <span className="font-medium text-green-600">
                      Disponible
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-primary-50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-primary-900 mb-4">
                  GarantÃ­a y soporte
                </h3>
                <ul className="space-y-2 text-sm text-primary-800">
                  <li>â€¢ GarantÃ­a oficial del fabricante</li>
                  <li>â€¢ Soporte tÃ©cnico especializado</li>
                  <li>â€¢ Repuestos originales disponibles</li>
                  <li>â€¢ Servicio de mantenimiento</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {filteredRelated.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-8">
                Productos relacionados
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredRelated.map((relatedProduct) => (
                  <ProductCardServer key={relatedProduct.id} product={relatedProduct} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateProductJsonLd(product, category || undefined)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateBreadcrumbJsonLd(breadcrumbItems)),
        }}
      />
    </div>
  )
}

export async function generateMetadata({ params }: ProductPageProps) {
  const resolvedParams = await params
  const product = await getProductBySlug(resolvedParams.slug)
  
  if (!product) {
    return {
      title: 'Producto no encontrado',
    }
  }

  return generateProductMetadata(product)
}

export default async function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = await params
  
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <div className="animate-pulse">
          <div className="h-16 bg-gray-200"></div>
          <div className="container mx-auto px-4 py-8">
            <div className="h-8 bg-gray-200 rounded mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="h-96 bg-gray-200 rounded-2xl"></div>
              <div className="space-y-6">
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    }>
      <ProductContent slug={resolvedParams.slug} />
    </Suspense>
  )
}

