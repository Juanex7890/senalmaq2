import { MetadataRoute } from 'next'
import { getCategories } from '@/lib/actions/categories'
import { getProductsWithPagination } from '@/lib/actions/products'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://senalmaq.com'
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/categorias`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/busqueda`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/carrito`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ]

  // Category pages
  const categories = await getCategories()
  const categoryPages = categories.map((category) => ({
    url: `${baseUrl}/categoria/${category.slug}`,
    lastModified: category.updatedAt || new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Product pages (limit to first 1000 for performance)
  const { products } = await getProductsWithPagination({}, { page: 1, limit: 1000 })
  const productPages = products.map((product) => ({
    url: `${baseUrl}/producto/${product.name.toLowerCase().replace(/\s+/g, '-')}`,
    lastModified: product.updatedAt || new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...categoryPages, ...productPages]
}
