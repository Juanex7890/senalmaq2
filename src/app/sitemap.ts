import { MetadataRoute } from 'next'
import { getCategories } from '@/lib/actions/categories'

const FALLBACK_BASE_URL = 'https://senalmaq.com'

const normalizeBaseUrl = (url?: string | null) => {
  if (!url) return FALLBACK_BASE_URL
  return url.replace(/\/+$/, '')
}

const fetchProductSlugs = async (baseUrl: string): Promise<string[]> => {
  try {
    const response = await fetch(`${baseUrl}/api/product-slugs`, {
      next: { revalidate: 300 },
    })

    if (!response.ok) {
      throw new Error(`Unexpected response: ${response.status}`)
    }

    const data = await response.json()
    if (!Array.isArray(data)) {
      return []
    }

    return Array.from(
      new Set(
        data
          .map((slug) => (typeof slug === 'string' ? slug.trim() : ''))
          .filter(Boolean)
      )
    )
  } catch (error) {
    console.error('Error fetching product slugs for sitemap:', error)
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = normalizeBaseUrl(process.env.NEXT_PUBLIC_SITE_URL)
  const categories = await getCategories()
  const productSlugs = await fetchProductSlugs(baseUrl)

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, changeFrequency: 'daily' },
    { url: `${baseUrl}/categorias`, changeFrequency: 'weekly' },
    { url: `${baseUrl}/busqueda`, changeFrequency: 'daily' },
  ]

  const categoryEntries: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${baseUrl}/categoria/${category.slug}`,
    changeFrequency: 'weekly',
  }))

  const productEntries: MetadataRoute.Sitemap = productSlugs.map((slug) => ({
    url: `${baseUrl}/producto/${slug}`,
    changeFrequency: 'weekly',
  }))

  return [...staticEntries, ...categoryEntries, ...productEntries]
}
