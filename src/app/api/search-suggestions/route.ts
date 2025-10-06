import { NextRequest, NextResponse } from 'next/server'
import { searchProducts } from '@/lib/actions/products'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '8')

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ products: [] })
    }

    const { products } = await searchProducts(query.trim(), {}, { page: 1, limit })

    return NextResponse.json({ products })
  } catch (error) {
    console.error('Error fetching search suggestions:', error)
    return NextResponse.json({ products: [] }, { status: 500 })
  }
}
