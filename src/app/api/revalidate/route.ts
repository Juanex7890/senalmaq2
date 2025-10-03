import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function POST(request: NextRequest) {
  try {
    const { token, paths } = await request.json()

    // Verify the revalidation token
    if (token !== process.env.REVALIDATE_TOKEN) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Revalidate the specified paths
    if (paths && Array.isArray(paths)) {
      paths.forEach((path: string) => {
        revalidatePath(path)
      })
    } else {
      // Revalidate common paths
      revalidatePath('/')
      revalidatePath('/categorias')
      revalidatePath('/busqueda')
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Paths revalidated successfully',
      revalidated: paths || ['/', '/categorias', '/busqueda']
    })
  } catch (error) {
    console.error('Revalidation error:', error)
    return NextResponse.json(
      { error: 'Failed to revalidate paths' }, 
      { status: 500 }
    )
  }
}
