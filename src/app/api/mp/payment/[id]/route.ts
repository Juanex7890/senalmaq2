import { NextResponse } from 'next/server'

import { getPayment } from '@/lib/mercadopago'

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await context.params
  const paymentId = resolvedParams?.id

  if (!paymentId) {
    return NextResponse.json(
      { error: 'Payment id is required' },
      { status: 400 }
    )
  }

  try {
    const payment = await getPayment(paymentId)

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        id: payment.id ?? paymentId,
        status: payment.status ?? null,
        status_detail: payment.status_detail ?? null,
        payment_method_id:
          payment.payment_method_id ??
          payment.payment_method?.id ??
          null,
        external_reference: payment.external_reference ?? null,
        transaction_amount: payment.transaction_amount ?? null,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    )
  } catch (error) {
    console.error('Failed to fetch Mercado Pago payment', {
      paymentId,
      error: error instanceof Error ? error.message : error,
    })

    return NextResponse.json(
      { error: 'Unable to retrieve payment information' },
      { status: 500 }
    )
  }
}
