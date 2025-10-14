import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl

    // Temporarily disable admin protection for debugging
    // TODO: Re-enable authentication once data loading is working
    // TODO: To enforce non-www you can redirect when the host starts with "www."
    // const host = request.headers.get('host')
    // if (host?.startsWith('www.')) {
    //   return NextResponse.redirect(`https://${host.slice(4)}${request.nextUrl.pathname}${request.nextUrl.search}`)
    // }
    //
    // TODO: To block /admin without an auth cookie:
    // if (pathname.startsWith('/admin') && !request.cookies.get('auth-token')) {
    //   return NextResponse.redirect(new URL('/login', request.url))
    // }
    return NextResponse.next()
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    '/admin/:path*'
  ],
}
