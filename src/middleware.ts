import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Temporarily disable admin protection for debugging
  // TODO: Re-enable authentication once data loading is working
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
  ],
}
