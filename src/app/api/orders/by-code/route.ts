import { NextRequest, NextResponse } from 'next/server'

import { getOrderByVerificationCode } from '@/lib/orders'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')?.trim()

  if (!code) {
    return NextResponse.json(
      { error: 'code is required' },
      {
        status: 400,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    )
  }

  const record = getOrderByVerificationCode(code)

  if (!record) {
    return NextResponse.json(
      { error: 'order not found' },
      {
        status: 404,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    )
  }

  return NextResponse.json(
    {
      orderId: record.reference,
      status: record.status,
      updatedAt: record.updatedAt,
      verificationCode: record.verificationCode,
      items: record.items,
      history: record.history,
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  )
}
