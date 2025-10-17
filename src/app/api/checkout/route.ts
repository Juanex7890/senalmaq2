import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { toCOP } from '@/lib/currency'
import { createPreference } from '@/lib/mercadopago'
import type { PreferenceRequest } from 'mercadopago/dist/clients/preference/commonTypes'

const checkoutSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().min(1, 'Item id is required'),
      title: z.string().min(1, 'Item title is required'),
      quantity: z.number().int().positive('Quantity must be greater than zero'),
      unit_price: z.number().positive('Unit price must be greater than zero'),
      description: z.string().optional(),
      picture_url: z.string().url().optional(),
      category_id: z.string().optional(),
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
    itemsCount: z.number().int().positive().optional(),
    cartTotal: z.number().positive().optional(),
  }),
})

const parseMercadoPagoError = (error: unknown) => {
  if (!error || typeof error !== 'object') {
    return undefined
  }

  const candidate = error as {
    message?: string
    status?: number
    error?: string
    cause?: Array<Record<string, unknown>> | Record<string, unknown>
  }

  const cause = Array.isArray(candidate.cause)
    ? candidate.cause.map(entry => {
        if (!entry || typeof entry !== 'object') {
          return entry
        }
        const { code, description } = entry as { code?: string | number; description?: string }
        return { code, description }
      })
    : candidate.cause

  return {
    message: candidate.message,
    status: candidate.status,
    error: candidate.error,
    cause,
  }
}

const resolveSiteUrl = (request: NextRequest) => {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (configured && configured.length > 0) {
    return configured.endsWith('/') ? configured.slice(0, -1) : configured
  }

  const origin = request.nextUrl.origin
  console.warn('NEXT_PUBLIC_SITE_URL is not configured. Using request origin as fallback.', {
    origin,
  })
  return origin.endsWith('/') ? origin.slice(0, -1) : origin
}

const parsePositiveInt = (value?: string) => {
  if (!value) {
    return undefined
  }

  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined
}

const parseBooleanEnv = (value?: string) => {
  if (!value) {
    return undefined
  }

  const normalized = value.trim().toLowerCase()
  if (['true', '1', 'yes', 'on'].includes(normalized)) {
    return true
  }

  if (['false', '0', 'no', 'off'].includes(normalized)) {
    return false
  }

  return undefined
}

const parseCsvEnv = (value?: string) => {
  if (!value) {
    return undefined
  }

  const entries = value
    .split(',')
    .map(entry => entry.trim())
    .filter(Boolean)

  return entries.length > 0 ? entries : undefined
}

const buildPaymentMethodsConfig = (): PreferenceRequest['payment_methods'] => {
  const excludedPaymentMethods = parseCsvEnv(process.env.MP_EXCLUDED_PAYMENT_METHODS)
  const excludedPaymentTypes = parseCsvEnv(process.env.MP_EXCLUDED_PAYMENT_TYPES)
  const maxInstallments = parsePositiveInt(process.env.MP_MAX_INSTALLMENTS)
  const defaultInstallments = parsePositiveInt(process.env.MP_DEFAULT_INSTALLMENTS) ?? 1

  const paymentMethods: NonNullable<PreferenceRequest['payment_methods']> = {}

  if (excludedPaymentMethods) {
    paymentMethods.excluded_payment_methods = excludedPaymentMethods.map(id => ({ id }))
  }

  if (excludedPaymentTypes) {
    paymentMethods.excluded_payment_types = excludedPaymentTypes.map(id => ({ id }))
  }

  if (maxInstallments) {
    paymentMethods.installments = maxInstallments
  }

  if (defaultInstallments) {
    paymentMethods.default_installments = defaultInstallments
  }

  return Object.keys(paymentMethods).length > 0 ? paymentMethods : undefined
}

const resolveNotificationUrl = (siteUrl: string) => {
  const explicit = process.env.MP_NOTIFICATION_URL?.trim()
  if (explicit && explicit.length > 0) {
    return explicit
  }

  return `${siteUrl}/api/mercadopago/webhook`
}

const resolveAutoReturn = (): PreferenceRequest['auto_return'] => {
  const candidate = process.env.MP_AUTO_RETURN?.trim().toLowerCase()
  if (candidate === 'approved' || candidate === 'all') {
    return candidate
  }

  return 'approved'
}

const resolveDifferentialPricingId = () =>
  parsePositiveInt(process.env.MP_DIFFERENTIAL_PRICING_ID)

const resolveStatementDescriptor = () => {
  const descriptor = process.env.MP_STATEMENT_DESCRIPTOR?.trim()
  return descriptor && descriptor.length > 0 ? descriptor : undefined
}

const resolveBinaryMode = () => parseBooleanEnv(process.env.MP_BINARY_MODE) ?? false

export async function POST(request: NextRequest) {
  const siteUrl = resolveSiteUrl(request)
  const notificationUrl = resolveNotificationUrl(siteUrl)
  const autoReturn = resolveAutoReturn()
  const differentialPricingId = resolveDifferentialPricingId()
  const statementDescriptor = resolveStatementDescriptor()
  const binaryMode = resolveBinaryMode()

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

  const normalizedItems: PreferenceRequest['items'] = payload.items.map(item => ({
    id: item.id,
    title: item.title,
    description: item.description,
    picture_url: item.picture_url,
    category_id: item.category_id,
    quantity: item.quantity,
    currency_id: 'COP',
    unit_price: toCOP(item.unit_price),
  }))

  const cartTotal = normalizedItems.reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0
  )

  if (
    typeof payload.metadata.cartTotal === 'number' &&
    Math.abs(payload.metadata.cartTotal - cartTotal) > 1
  ) {
    console.warn('Cart total mismatch between client and server', {
      cartId: payload.metadata.cartId,
      clientCartTotal: payload.metadata.cartTotal,
      serverCartTotal: cartTotal,
    })
  }

  const metadata = {
    ...payload.metadata,
    itemsCount: payload.metadata.itemsCount ?? normalizedItems.length,
    cartTotal,
    currency: 'COP',
  }

  const paymentMethods = buildPaymentMethodsConfig()

  try {
    console.log(
      'Creating MP preference for cart:',
      payload?.metadata?.cartId,
      'items:',
      payload?.items?.length,
      'binaryMode:',
      binaryMode,
      'autoReturn:',
      autoReturn
    )

    const preferenceBody: PreferenceRequest = {
      items: normalizedItems,
      payer: payload.payer,
      metadata,
      external_reference: payload.metadata.cartId,
      auto_return: autoReturn,
      back_urls: {
        success: `${siteUrl}/checkout/success`,
        pending: `${siteUrl}/checkout/pending`,
        failure: `${siteUrl}/checkout/failure`,
      },
      notification_url: notificationUrl,
      binary_mode: binaryMode,
    }

    if (paymentMethods) {
      preferenceBody.payment_methods = paymentMethods
    }

    if (differentialPricingId) {
      preferenceBody.differential_pricing = { id: differentialPricingId }
    }

    if (statementDescriptor) {
      preferenceBody.statement_descriptor = statementDescriptor
    }

    const preferenceResponse = await createPreference(preferenceBody)

    const hasInitPoint =
      Boolean(preferenceResponse?.init_point) || Boolean(preferenceResponse?.sandbox_init_point)

    if (!preferenceResponse?.id || !hasInitPoint) {
      throw new Error('Unexpected Mercado Pago preference response')
    }

    return NextResponse.json(
      {
        id: preferenceResponse.id,
        init_point: preferenceResponse.init_point,
        sandbox_init_point: preferenceResponse.sandbox_init_point,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    )
  } catch (error) {
    const mpError = parseMercadoPagoError(error)
    const message =
      mpError?.message ?? (error instanceof Error ? error.message : 'Unknown Mercado Pago error')

    console.error('Failed to create Mercado Pago preference', {
      cartId: payload?.metadata?.cartId,
      error: message,
      status: mpError?.status,
      code: mpError?.error,
      cause: mpError?.cause,
    })

    return NextResponse.json(
      { error: 'No pudimos iniciar el pago. Intenta nuevamente.' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
