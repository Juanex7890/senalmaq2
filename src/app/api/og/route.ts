import { NextRequest } from 'next/server'

const CACHE_CONTROL = 'public, max-age=600'

export function GET(request: NextRequest) {
  const url = new URL(request.url)
  const target = url.searchParams.get('u')

  if (!target || !target.startsWith('https://')) {
    return new Response('Invalid target URL', { status: 400 })
  }

  return new Response(null, {
    status: 302,
    headers: {
      Location: target,
      'Cache-Control': CACHE_CONTROL,
    },
  })
}
