import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getProductBySlug } from '@/lib/actions/products'
import { getImageUrl } from '@/lib/utils'

const stripHtml = (value?: string): string =>
  value ? value.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim() : ''

const truncate = (value: string, length: number): string =>
  value.length > length ? `${value.slice(0, length - 1).trimEnd()}...` : value

export async function GET(_request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const product = await getProductBySlug(params.slug)

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const images = [
      ...(Array.isArray(product.images) ? product.images : []),
      ...(Array.isArray(product.imagePaths) ? product.imagePaths.map((path) => getImageUrl(path)) : []),
      product.imageUrl,
    ].filter((value): value is string => Boolean(value))

    const description = truncate(stripHtml((product as { shortDescription?: string }).shortDescription) || stripHtml(product.description), 180)

    return NextResponse.json({
      title: product.name,
      shortDescription: description || undefined,
      images: Array.from(new Set(images)),
      price: Number.isFinite(product.price) ? product.price : undefined,
    })
  } catch (error) {
    console.error('[api/product/[slug]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
