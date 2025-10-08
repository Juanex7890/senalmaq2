import { NextResponse } from 'next/server'
import { getAllProducts } from '@/lib/actions/products'
import { generateSlug } from '@/lib/utils'

export async function GET() {
  try {
    const products = await getAllProducts()

    const slugs = Array.from(
      new Set(
        products
          .map((product) => {
            if (product.slug) {
              return product.slug.trim()
            }
            if (product.name) {
              return generateSlug(product.name)
            }
            return ''
          })
          .filter(Boolean)
      )
    )

    return NextResponse.json(slugs)
  } catch (error) {
    console.error('Error fetching product slugs:', error)
    return NextResponse.json([], { status: 500 })
  }
}
