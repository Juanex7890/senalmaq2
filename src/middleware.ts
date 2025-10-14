import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Add more robust error handling for production
  try {
    // Basic request validation
    if (!request || !request.nextUrl) {
      console.error('Invalid request object in middleware')
      return NextResponse.next()
    }

    const { pathname } = request.nextUrl

    // Log for debugging in production
    console.log(`Middleware processing: ${pathname}`)

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
    // Always return a response, even on error
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    // Temporarily disable middleware to fix production error
    // '/admin/:path*'
  ],
}
