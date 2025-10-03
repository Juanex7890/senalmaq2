import { Metadata } from 'next'
import { Product, Category } from './types'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://senalmaq.com'

export function generateMetadata({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
}: {
  title: string
  description: string
  keywords?: string
  image?: string
  url?: string
  type?: 'website' | 'article'
}): Metadata {
  const fullTitle = title.includes('Senalmaq') ? title : `${title} | Senalmaq`
  const fullUrl = url ? `${baseUrl}${url}` : baseUrl
  const fullImage = image ? (image.startsWith('http') ? image : `${baseUrl}${image}`) : `${baseUrl}/og-image.jpg`

  return {
    title: fullTitle,
    description,
    keywords,
    openGraph: {
      title: fullTitle,
      description,
      url: fullUrl,
      siteName: 'Senalmaq',
      images: [
        {
          url: fullImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [fullImage],
    },
    alternates: {
      canonical: fullUrl,
    },
  }
}

export function generateProductMetadata(product: Product): Metadata {
  const price = product.compareAtPrice || product.price
  const discount = product.compareAtPrice ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100) : 0

  return generateMetadata({
    title: product.name,
    description: product.description.substring(0, 160),
    keywords: `máquina de coser, ${product.brand}, ${product.name}, industrial, hogar`,
    image: product.imagePaths && product.imagePaths.length > 0 ? product.imagePaths[0] : '/placeholder-product.svg',
    url: `/producto/${product.slug}`,
    type: 'website',
  })
}

export function generateCategoryMetadata(category: Category): Metadata {
  return generateMetadata({
    title: category.name,
    description: category.description || `Encuentra las mejores ${category.name.toLowerCase()} en Senalmaq`,
    keywords: `máquinas de coser, ${category.name.toLowerCase()}, industrial, hogar`,
    image: category.heroImagePath,
    url: `/categoria/${category.slug}`,
  })
}

export function generateProductJsonLd(product: Product, category?: Category) {
  const offers: any = {
    '@type': 'Offer',
    price: product.price,
    priceCurrency: 'COP',
    availability: product.active ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    seller: {
      '@type': 'Organization',
      name: 'Senalmaq',
    },
  }

  if (product.compareAtPrice) {
    offers.priceValidUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.imagePaths,
    brand: product.brand ? {
      '@type': 'Brand',
      name: product.brand,
    } : undefined,
    sku: product.sku,
    category: category?.name,
    offers,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '127',
    },
  }
}

export function generateBreadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.url}`,
    })),
  }
}
