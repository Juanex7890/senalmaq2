import { type NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Preference } from 'mercadopago'
import { z } from 'zod'

import { toCOP } from '@/lib/currency'

const checkoutSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().min(1, 'Item id is required'),
      title: z.string().min(1, 'Item title is required'),
      quantity: z.number().int().positive('Quantity must be greater than zero'),
      unit_price: z.number().positive('Unit price must be greater than zero'),
      description: z.string().optional(),
      picture_url: z.string().url().optional(),
    })
  ),
  payer: z
    .object({
      name: z.string().optional(),
      surname: z.string().optional(),
      email: z.string().email().optional(),
      phone: z
        .object({
          area_code: z.string().optional(),
          number: z.string().optional(),
        })
        .optional(),
      identification: z
        .object({
          type: z.string().optional(),
          number: z.string().optional(),
        })
        .optional(),
      address: z
        .object({
          zip_code: z.string().optional(),
          street_name: z.string().optional(),
          street_number: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
  metadata: z.object({
    cartId: z.string().min(1, 'cartId is required'),
  }),
})

export async function POST(request: NextRequest) {
  const accessToken = process.env.MP_ACCESS_TOKEN
  const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL

  if (!accessToken || !rawSiteUrl) {
    console.error('Missing Mercado Pago environment variables', {
      hasAccessToken: Boolean(accessToken),
      hasSiteUrl: Boolean(rawSiteUrl),
    })
    return NextResponse.json({ error: 'env missing' }, { status: 500 })
  }

  const siteUrl = rawSiteUrl.endsWith('/') ? rawSiteUrl.slice(0, -1) : rawSiteUrl

  let payload: z.infer<typeof checkoutSchema>

  try {
    const json = await request.json()
    payload = checkoutSchema.parse(json)
  } catch (error) {
    console.error('Invalid checkout payload', error)
    return NextResponse.json(
      { error: 'Informacion de checkout invalida' },
      { status: 400 }
    )
  }

  const client = new MercadoPagoConfig({ accessToken })
  const preference = new Preference(client)

  const normalizedItems = payload.items.map(item => ({
    ...item,
    currency_id: 'COP',
    unit_price: toCOP(item.unit_price),
  }))

  try {
    console.log(
      'Creating MP preference for cart:',
      payload?.metadata?.cartId,
      'items:',
      payload?.items?.length
    )

    const preferenceResponse = await preference.create({
      body: {
        items: normalizedItems,
        payer: payload.payer,
        metadata: payload.metadata,
        external_reference: payload.metadata.cartId,
        auto_return: 'approved',
        back_urls: {
          success: `${siteUrl}/checkout/success`,
          pending: `${siteUrl}/checkout/pending`,
          failure: `${siteUrl}/checkout/failure`,
        },
        notification_url: `${siteUrl}/api/mercadopago/webhook`,
        binary_mode: false,
      },
    })

    if (!preferenceResponse || !preferenceResponse.id || !preferenceResponse.init_point) {
      throw new Error('Unexpected Mercado Pago preference response')
    }

    return NextResponse.json(
      {
        id: preferenceResponse.id,
        init_point: preferenceResponse.init_point,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    )
  } catch (error) {
    console.error('Failed to create Mercado Pago preference', error)
    return NextResponse.json(
      { error: 'No pudimos iniciar el pago. Intenta nuevamente.' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
