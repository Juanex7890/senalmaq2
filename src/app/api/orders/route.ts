import { NextRequest, NextResponse } from 'next/server'

import { getOrderStatus } from '@/lib/orders'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const orderId = request.nextUrl.searchParams.get('orderId')?.trim()

  if (!orderId) {
    return NextResponse.json(
      { error: 'orderId is required' },
      {
        status: 400,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    )
  }

  const record = getOrderStatus(orderId)

  return NextResponse.json(
    {
      orderId,
      status: record?.status ?? 'pending',
      updatedAt: record?.updatedAt ?? null,
      history: record?.history ?? [],
      verificationCode: record?.verificationCode ?? null,
      items: record?.items ?? [],
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  )
}
