import { NextRequest, NextResponse } from 'next/server'

import { getMerchantOrder, getPayment, markOrderPaid } from '@/lib/mercadopago'

export const runtime = 'nodejs'

type WebhookPayload = {
  type?: string
  action?: string
  data?: {
    id?: string
  }
  id?: string
}

const safeLog = (message: string, context: Record<string, unknown>) => {
  // Avoid logging sensitive data while keeping useful debugging information.
  console.log(message, context)
}

const getEventInfo = (request: NextRequest, payload?: WebhookPayload) => {
  const { searchParams } = new URL(request.url)
  const type =
    payload?.type ??
    payload?.action ??
    searchParams.get('type') ??
    searchParams.get('topic') ??
    undefined

  const id =
    payload?.data?.id ??
    payload?.id ??
    searchParams.get('id') ??
    searchParams.get('data.id') ??
    undefined

  return { type, id }
}

const handleWebhookEvent = async (request: NextRequest, payload?: WebhookPayload) => {
  const eventInfo = getEventInfo(request, payload)

  safeLog('Mercado Pago webhook received', {
    method: request.method,
    type: eventInfo.type,
    id: eventInfo.id,
  })

  if (!eventInfo.type || !eventInfo.id) {
    return
  }

  try {
    switch (eventInfo.type) {
      case 'payment': {
        const payment = await getPayment(eventInfo.id)
        if (payment?.status === 'approved' && payment.external_reference) {
          await markOrderPaid(payment.external_reference)
          safeLog('Mercado Pago payment approved', {
            status: payment.status,
            externalReferencePresent: Boolean(payment.external_reference),
          })
        }
        break
      }
      case 'merchant_order': {
        const merchantOrder = await getMerchantOrder(eventInfo.id)
        safeLog('Mercado Pago merchant order fetched', {
          id: merchantOrder?.id,
          status: merchantOrder?.status,
        })
        break
      }
      default:
        safeLog('Unhandled Mercado Pago webhook type', { type: eventInfo.type })
    }
  } catch (error) {
    console.error('Error processing Mercado Pago webhook', error)
  }
}

const okResponse = (extra?: Record<string, unknown>) =>
  NextResponse.json(
    {
      received: true,
      ...extra,
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  )

export async function POST(request: NextRequest) {
  try {
    const json = (await request.json().catch(() => undefined)) as WebhookPayload | undefined
    await handleWebhookEvent(request, json)
    return okResponse()
  } catch (error) {
    console.error('Mercado Pago webhook POST error', error)
    return okResponse({ handled: false })
  }
}

export async function GET(request: NextRequest) {
  try {
    await handleWebhookEvent(request)
    return okResponse()
  } catch (error) {
    console.error('Mercado Pago webhook GET error', error)
    return okResponse({ handled: false })
  }
}
