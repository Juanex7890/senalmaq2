import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { buildWhatsAppLink, getSingleSearchParam, resolveCartId, type SearchParams } from '../utils'

interface CheckoutFailurePageProps {
  searchParams: Promise<SearchParams>
}

export default async function CheckoutFailurePage({ searchParams }: CheckoutFailurePageProps) {
  const resolvedSearchParams = await searchParams
  const cartId = resolveCartId(resolvedSearchParams)
  const paymentId =
    getSingleSearchParam(resolvedSearchParams, 'payment_id') ??
    getSingleSearchParam(resolvedSearchParams, 'paymentId')

  const whatsappMessageLines = [
    'Hola 👋, mi pago fue rechazado con Bold y necesito ayuda para finalizar la compra.',
  ]

  if (cartId) {
    whatsappMessageLines.push(`• Carrito: ${cartId}`)
  }

  if (paymentId) {
    whatsappMessageLines.push(`• Pago: ${paymentId}`)
  }

  whatsappMessageLines.push('• Estado: rechazado')

  const whatsappLink = buildWhatsAppLink(
    whatsappMessageLines.join('\n'),
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER
  )

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="max-w-xl space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">No pudimos completar tu pago</h1>
        <p className="text-lg text-gray-600">
          El intento de pago fue rechazado. Puedes intentarlo nuevamente o escribirnos y te ayudaremos
          a finalizar la compra.
        </p>
        <div className="space-y-2 text-sm text-gray-500">
          {cartId && (
            <p>
              Referencia de carrito:{' '}
              <span className="font-mono font-semibold">{cartId}</span>
            </p>
          )}
          {paymentId && (
            <p>
              ID de pago:{' '}
              <span className="font-mono font-semibold">{paymentId}</span>
            </p>
          )}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/carrito" className="sm:w-auto">
            <Button className="w-full sm:w-auto">Volver al carrito</Button>
          </Link>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="sm:w-auto"
          >
            <Button className="w-full sm:w-auto" variant="outline">
              Necesito ayuda por WhatsApp
            </Button>
          </a>
        </div>
      </div>
    </main>
  )
}
