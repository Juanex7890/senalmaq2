import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getProductBySlug } from '@/lib/actions/products'
import { getImageUrl } from '@/lib/utils'

const stripHtml = (value?: string): string =>
  value ? value.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim() : ''

const truncate = (value: string, length: number): string =>
  value.length > length ? `${value.slice(0, length - 1).trimEnd()}...` : value

export async function GET(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const product = await getProductBySlug(slug)

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const imageCandidates = [
      ...(Array.isArray(product.images) ? product.images : []),
      ...(Array.isArray(product.imagePaths) ? product.imagePaths : []),
      product.imageUrl,
      product.image,
    ]
      .filter((value): value is string => Boolean(value && value.trim()))
      .map((value) => getImageUrl(value))

    const images = Array.from(new Set(imageCandidates)).filter((url) => url.startsWith('http'))
    const description = truncate(
      stripHtml((product as { shortDescription?: string }).shortDescription) || stripHtml(product.description),
      180
    )

    return NextResponse.json({
      title: product.name,
      shortDescription: description || undefined,
      images,
      price: Number.isFinite(product.price) ? product.price : undefined,
    })
  } catch (error) {
    console.error('[api/product/[slug]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
