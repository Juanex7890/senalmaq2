import { MercadoPagoConfig, Payment, MerchantOrder } from 'mercadopago'

if (!process.env.MP_ACCESS_TOKEN) {
  throw new Error('MP_ACCESS_TOKEN is not configured')
}

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN })
const payment = new Payment(client)
const merchantOrder = new MerchantOrder(client)

export type MercadoPagoPayment = any
export type MercadoPagoMerchantOrder = any

export async function getPayment(id: string): Promise<MercadoPagoPayment> {
  const response = await payment.get({ id })
  return (response as any).body || response
}

export async function getMerchantOrder(id: string): Promise<MercadoPagoMerchantOrder> {
  const response = await merchantOrder.get({ merchantOrderId: id })
  return (response as any).body || response
}

export async function markOrderPaid(externalRef?: string): Promise<void> {
  if (!externalRef) {
    return
  }

  // TODO: actualiza orden en Firestore/Supabase por cartId=externalRef, set status=paid, fechaPago=now
  // TODO: vaciar carrito tras confirmación real del webhook (markOrderPaid)
}
