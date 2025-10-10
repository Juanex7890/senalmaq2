import mercadopago from 'mercadopago'

if (!process.env.MP_ACCESS_TOKEN) {
  throw new Error('MP_ACCESS_TOKEN is not configured')
}

mercadopago.configure({ access_token: process.env.MP_ACCESS_TOKEN })

export type MercadoPagoPayment = Awaited<ReturnType<typeof mercadopago.payment.findById>>['body']
export type MercadoPagoMerchantOrder = Awaited<ReturnType<typeof mercadopago.merchant_orders.get>>['body']

export async function getPayment(id: string): Promise<MercadoPagoPayment> {
  return (await mercadopago.payment.findById(id)).body
}

export async function getMerchantOrder(id: string): Promise<MercadoPagoMerchantOrder> {
  return (await mercadopago.merchant_orders.get(id)).body
}

export async function markOrderPaid(externalRef?: string): Promise<void> {
  if (!externalRef) {
    return
  }

  // TODO: actualiza orden en Firestore/Supabase por cartId=externalRef, set status=paid, fechaPago=now
  // TODO: vaciar carrito tras confirmación real del webhook (markOrderPaid)
}
