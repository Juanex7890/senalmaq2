import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'

import { markOrderPaid, markOrderRejected, markOrderVoided, recordBoldEvent } from '@/lib/orders'

type BoldWebhookPayload = {
  type?: string
  event?: string
  data?: {
    metadata?: {
      reference?: string
      cartId?: string
      orderId?: string
    }
    reference?: string
    orderId?: string
    cartId?: string
    status?: string
  }
  metadata?: {
    reference?: string
    cartId?: string
    orderId?: string
  }
  reference?: string
}

const extractReference = (payload: BoldWebhookPayload): string | undefined => {
  return (
    payload?.data?.metadata?.reference ??
    payload?.data?.metadata?.orderId ??
    payload?.data?.metadata?.cartId ??
    payload?.metadata?.reference ??
    payload?.metadata?.orderId ??
    payload?.metadata?.cartId ??
    payload?.data?.reference ??
    payload?.data?.orderId ??
    payload?.data?.cartId ??
    payload?.reference
  )
}

const handleEvent = async (payload: BoldWebhookPayload) => {
  const eventType = payload?.type ?? payload?.event ?? payload?.data?.status
  if (!eventType) {
    return
  }

  const reference = extractReference(payload)

  recordBoldEvent({
    type: eventType,
    reference,
    payload,
  })

  console.log('[bold:webhook]', { type: eventType, reference })

  try {
    if (eventType === 'SALE_APPROVED') {
      await markOrderPaid(reference)
      return
    }

    if (eventType === 'SALE_REJECTED') {
      await markOrderRejected(reference)
      console.log('[bold:webhook] Order marked as rejected', { reference })
      return
    }

    if (eventType.startsWith('VOID_')) {
      await markOrderVoided(reference)
      console.log('[bold:webhook] Order marked as voided', { reference, type: eventType })
      return
    }

    console.log('[bold:webhook] Unhandled event type', { type: eventType })
  } catch (error) {
    console.error('[Bold webhook] Error handling event', { type: eventType, error })
  }
}

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const secretKey = process.env.BOLD_SECRET_KEY

  if (!secretKey) {
    console.error('BOLD_SECRET_KEY is not configured')
    return NextResponse.json(
      { ok: false },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    )
  }

  const rawBody = await request.text()
  const receivedSignature = request.headers.get('x-bold-signature')?.trim()

  if (!receivedSignature) {
    console.warn('[bold:webhook] Missing signature header')
    return NextResponse.json(
      { ok: false },
      {
        status: 400,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    )
  }

  let providedBuffer: Buffer | undefined
  let computedBuffer: Buffer | undefined

  try {
    providedBuffer = Buffer.from(receivedSignature, 'hex')
  } catch (error) {
    console.warn('[bold:webhook] Invalid signature encoding', {
      error: error instanceof Error ? error.message : error,
    })
  }

  const computedSignature = createHmac('sha256', secretKey)
    .update(rawBody, 'utf8')
    .digest('hex')

  try {
    computedBuffer = Buffer.from(computedSignature, 'hex')
  } catch (error) {
    console.error('[bold:webhook] Unable to encode computed signature', error)
  }

  const signaturesMatch =
    providedBuffer &&
    computedBuffer &&
    providedBuffer.length === computedBuffer.length &&
    timingSafeEqual(providedBuffer, computedBuffer)

  if (!signaturesMatch) {
    console.warn('[bold:webhook] Signature mismatch')
    return NextResponse.json(
      { ok: false },
      {
        status: 400,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    )
  }

  try {
    const payload = rawBody ? (JSON.parse(rawBody) as BoldWebhookPayload) : undefined
    await handleEvent(payload ?? {})
  } catch (error) {
    console.error('[Bold webhook] Failed to parse payload', error)
  }

  return NextResponse.json(
    { ok: true },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  )
}
