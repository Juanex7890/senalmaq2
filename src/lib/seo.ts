import { Metadata } from 'next'
import { Product, Category } from './types'
import { generateSlug, getImageUrl } from './utils'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.senalmaq.com'
const defaultOgImage = getImageUrl('/og-default.jpg')

const toAbsoluteUrl = (value?: string) => {
  if (!value) {
    return baseUrl
  }

  try {
    return new URL(value, baseUrl).toString()
  } catch {
    return `${baseUrl}${value.startsWith('/') ? value : `/${value}`}`
  }
}

const stripHtml = (value?: string) =>
  value ? value.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim() : ''

const truncate = (value: string, maxLength = 160) => {
  if (value.length <= maxLength) {
    return value
  }

  return `${value.slice(0, maxLength - 1).trimEnd()}...`
}

const collectProductImages = (product: Product) => {
  const candidates = [
    ...(Array.isArray(product.images) ? product.images : []),
    ...(Array.isArray(product.imagePaths) ? product.imagePaths : []),
    product.imageUrl,
    product.image,
  ].filter((value): value is string => Boolean(value && value.trim()))

  const unique = Array.from(new Set(candidates))
  return unique.map((path) => getImageUrl(path))
}

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
  const canonicalUrl = toAbsoluteUrl(url)
  const fullImage = image ? getImageUrl(image) : defaultOgImage

  return {
    title: fullTitle,
    description,
    keywords,
    openGraph: {
      title: fullTitle,
      description,
      url: canonicalUrl,
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
      canonical: canonicalUrl,
    },
  }
}

export function generateProductMetadata(product: Product): Metadata {
  const shortDescription = stripHtml((product as { shortDescription?: string }).shortDescription)
  const descriptionSource = shortDescription || stripHtml(product.description)
  const description = truncate(descriptionSource || 'Producto Senalmaq')

  const keywords = [
    'maquina de coser',
    product.brand,
    product.name,
    'industrial',
    'hogar',
  ]
    .filter((value): value is string => Boolean(value && value.trim()))
    .join(', ')

  const slug = product.slug?.trim() || generateSlug(product.name)
  const images = collectProductImages(product)

  return generateMetadata({
    title: product.name,
    description,
    keywords,
    image: images[0] ?? defaultOgImage,
    url: `/producto/${slug}`,
    type: 'website',
  })
}

export function generateCategoryMetadata(category: Category): Metadata {
  const categoryDescription =
    category.description || `Encuentra las mejores ${category.name.toLowerCase()} en Senalmaq`
  const keywords = [
    'maquinas de coser',
    category.name.toLowerCase(),
    'industrial',
    'hogar',
  ].join(', ')

  return generateMetadata({
    title: category.name,
    description: truncate(categoryDescription),
    keywords,
    image: category.heroImagePath,
    url: `/categoria/${category.slug}`,
  })
}

export function generateProductJsonLd(product: Product, category?: Category) {
  const slug = product.slug?.trim() || generateSlug(product.name)
  const description =
    stripHtml((product as { shortDescription?: string }).shortDescription) ||
    stripHtml(product.description) ||
    'Producto Senalmaq'
  const images = collectProductImages(product)

  const offers: Record<string, any> = {
    '@type': 'Offer',
    price: product.price,
    priceCurrency: 'COP',
    availability: product.active ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    url: toAbsoluteUrl(`/producto/${slug}`),
    seller: {
      '@type': 'Organization',
      name: 'Senalmaq',
    },
  }

  if (product.compareAtPrice) {
    offers.priceSpecification = {
      '@type': 'UnitPriceSpecification',
      priceCurrency: 'COP',
      price: product.compareAtPrice,
    }
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description,
    image: images.length > 0 ? images.slice(0, 10) : [defaultOgImage],
    brand: product.brand
      ? {
          '@type': 'Brand',
          name: product.brand,
        }
      : undefined,
    sku: product.sku,
    category: category?.name,
    url: toAbsoluteUrl(`/producto/${slug}`),
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
      item: toAbsoluteUrl(item.url),
    })),
  }
}
