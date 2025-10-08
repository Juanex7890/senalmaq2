import { Suspense } from 'react'
import Link from 'next/link'
import type { Metadata } from 'next'
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
import { getImageUrl } from '@/lib/utils'

interface ProductPageProps {
  params: { slug: string }
}

type ProductApiResult = {
  title?: string
  shortDescription?: string
  images?: string[] | string
  price?: number
}

const FALLBACK_IMAGE = '/placeholder-product.svg'

const stripHtml = (value?: string): string =>
  value ? value.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim() : ''

const toSlug = (name: string, explicitSlug?: string | null): string => {
  if (explicitSlug) {
    return explicitSlug
  }

  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

const toAbsoluteUrl = (baseUrl: string, path: string): string => {
  if (path.startsWith('http')) {
    return path
  }
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`
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
  const filteredRelated = relatedProducts.filter((p) => p.id !== product.id).slice(0, 4)

  const productSlug = toSlug(product.name, product.slug)
  const breadcrumbItems = [
    { name: 'Inicio', url: '/' },
     { name: 'Categorías', url: '/categorias' },
    ...(category ? [{ name: category.name, url: `/categoria/${category.slug}` }] : []),
    { name: product.name, url: `/producto/${productSlug}` },
  ]

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.senalmaq.com'
  const imageCandidates = [
    ...(Array.isArray(product.images) ? product.images : []),
    ...(Array.isArray(product.imagePaths) ? product.imagePaths.map((path) => getImageUrl(path)) : []),
    product.imageUrl,
  ].filter((value): value is string => Boolean(value))
  const uniqueImages = Array.from(new Set(imageCandidates))
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: uniqueImages.length > 0 ? uniqueImages.slice(0, 4) : [FALLBACK_IMAGE],
    description:
      stripHtml((product as { shortDescription?: string }).shortDescription) ||
      stripHtml(product.description) ||
      'Descubre mA�s sobre este producto Senalmaq.',
    brand: {
      '@type': 'Brand',
      name: 'Senalmaq',
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'COP',
      price: Number.isFinite(product.price) ? product.price.toString() : '0',
      availability: 'https://schema.org/InStock',
      url: `${baseUrl}/producto/${productSlug}`,
    },
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header categories={categories} />

      <main className="py-8">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-primary-600">
              Inicio
            </Link>
            <span>/</span>
             <Link href="/categorias" className="hover:text-primary-600">
               Categorías
             </Link>
            {category && (
              <>
                <span>/</span>
                <Link href={`/categoria/${category.slug}`} className="hover:text-primary-600">
                  {category.name}
                </Link>
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
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
                {product.brand && <p className="text-lg text-gray-600 mb-2">{product.brand}</p>}
                {product.sku && <p className="text-sm text-gray-500">SKU: {product.sku}</p>}
              </div>

              <div className="prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: product.description }} />
              </div>

              <BuyButtonsClient product={product} />
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
                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del producto</h3>
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
                     <span className="text-gray-600">Categoría:</span>
                    <span className="font-medium">
                      {category?.name ||
                        product.categoryName ||
                        (typeof product.category === 'string' ? product.category : 'Sin categoría')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estado:</span>
                    <span className="font-medium text-green-600">Disponible</span>
                  </div>
                </div>
              </div>

              <div className="bg-primary-50 rounded-2xl p-6">
                 <h3 className="text-lg font-semibold text-primary-900 mb-4">Garantía y soporte</h3>
                <ul className="space-y-2 text-sm text-primary-800">
                  <li>Garantia oficial del fabricante</li>
                  <li> Soporte tecnico especializado</li>
                  <li>Repuestos originales disponibles</li>
                  <li> Servicio de mantenimiento</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {filteredRelated.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Productos relacionados</h2>
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
          __html: JSON.stringify(jsonLd),
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

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const slug = params.slug
  const safeSlug = encodeURIComponent(slug)
  const endpoint = `/api/product/${safeSlug}`

  try {
    const response = await fetch(endpoint, { next: { revalidate: 300 } })
    if (!response.ok) {
      throw new Error(`Failed to fetch product metadata for ${slug}`)
    }

    const product: ProductApiResult = await response.json()
    const productTitle = product.title?.trim()
    const shortDescription = product.shortDescription?.trim()
    const metadataTitle = productTitle ? `${productTitle} | Senalmaq` : 'Producto | Senalmaq'
    const metadataDescription = shortDescription ?? 'Producto Senalmaq'
    const rawImage = product.images?.[0] || '/og-default.jpg'
    const proxiedImage = rawImage
    const pageUrl = `/producto/${params.slug}`
    const ogTitle = productTitle ?? 'Producto Senalmaq'
    const ogDescription = shortDescription ?? ''

    return {
      title: metadataTitle,
      description: metadataDescription,
      openGraph: {
        type: 'website',
        title: ogTitle,
        description: ogDescription,
        url: pageUrl,
        images: [
          {
            url: proxiedImage,
            secureUrl: proxiedImage,
            width: 1200,
            height: 630,
            alt: ogTitle,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: ogTitle,
        description: ogDescription,
        images: [proxiedImage],
      },
    }
  } catch (error) {
    const fallbackTitle = 'Producto | Senalmaq'
    const fallbackDescription = 'Producto Senalmaq'
    const rawFallbackImage = '/og-default.jpg'
    const proxiedFallbackImage = rawFallbackImage
    const pageUrl = `/producto/${params.slug}`

    return {
      title: fallbackTitle,
      description: fallbackDescription,
      openGraph: {
        type: 'website',
        title: fallbackTitle,
        description: fallbackDescription,
        url: pageUrl,
        images: [
          {
            url: proxiedFallbackImage,
            secureUrl: proxiedFallbackImage,
            width: 1200,
            height: 630,
            alt: fallbackTitle,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: fallbackTitle,
        description: fallbackDescription,
        images: [proxiedFallbackImage],
      },
    }
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  return (
    <Suspense
      fallback={
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
      }
    >
      <ProductContent slug={params.slug} />
    </Suspense>
  )
}
