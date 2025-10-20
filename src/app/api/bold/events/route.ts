import { NextResponse } from 'next/server'

import { getRecentBoldEvents } from '@/lib/orders'

export const runtime = 'nodejs'

export async function GET() {
  return NextResponse.json(
    { events: getRecentBoldEvents() },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  )
}
