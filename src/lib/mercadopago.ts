import { MercadoPagoConfig, Payment, MerchantOrder, Preference } from 'mercadopago'
import type { Options } from 'mercadopago/dist/types'
import type { PaymentResponse } from 'mercadopago/dist/clients/payment/commonTypes'
import type { OrderResponse } from 'mercadopago/dist/clients/order/commonTypes'
import type {
  PreferenceRequest,
  PreferenceResponse,
} from 'mercadopago/dist/clients/preference/commonTypes'

if (!process.env.MP_ACCESS_TOKEN) {
  throw new Error('MP_ACCESS_TOKEN is not configured')
}

const resolveNumericEnv = (value?: string) => {
  if (!value) {
    return undefined
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined
}

const buildClientOptions = (): Options | undefined => {
  const options: Options = {}

  const timeout = resolveNumericEnv(process.env.MP_TIMEOUT_MS)
  if (timeout) {
    options.timeout = timeout
  }

  if (process.env.MP_INTEGRATOR_ID) {
    options.integratorId = process.env.MP_INTEGRATOR_ID
  }

  if (process.env.MP_PLATFORM_ID) {
    options.plataformId = process.env.MP_PLATFORM_ID
  }

  if (process.env.MP_CORPORATION_ID) {
    options.corporationId = process.env.MP_CORPORATION_ID
  }

  return Object.keys(options).length > 0 ? options : undefined
}

export const mercadoPagoClient = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
  options: buildClientOptions(),
})

const payment = new Payment(mercadoPagoClient)
const merchantOrder = new MerchantOrder(mercadoPagoClient)
const preference = new Preference(mercadoPagoClient)

const unwrapResponse = <T>(value: T | { body?: T }) => {
  if (value && typeof value === 'object' && 'body' in value) {
    const candidate = value as { body?: T }
    if (candidate.body) {
      return candidate.body
    }
  }

  return value as T
}

export type MercadoPagoPayment = PaymentResponse
export type MercadoPagoMerchantOrder = OrderResponse

export async function createPreference(body: PreferenceRequest): Promise<PreferenceResponse> {
  const response = await preference.create({ body })
  return unwrapResponse(response)
}

export async function getPayment(id: string): Promise<MercadoPagoPayment> {
  const response = await payment.get({ id })
  return unwrapResponse(response)
}

export async function getMerchantOrder(id: string): Promise<MercadoPagoMerchantOrder> {
  const response = await merchantOrder.get({ merchantOrderId: id })
  return unwrapResponse(response)
}

export async function markOrderPaid(externalRef?: string): Promise<void> {
  if (!externalRef) {
    return
  }

  // TODO: actualiza orden en Firestore/Supabase por cartId=externalRef, set status=paid, fechaPago=now
  // TODO: vaciar carrito tras confirmacion real del webhook (markOrderPaid)
}
