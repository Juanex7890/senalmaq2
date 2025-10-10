import Link from 'next/link'

import { Button } from '@/components/ui/button'

import {
  buildWhatsAppLink,
  resolveCartId,
  type SearchParams,
} from '../utils'
import { CartSummary } from '../components/cart-summary'

interface CheckoutSuccessPageProps {
  searchParams: Promise<SearchParams>
}

export default async function CheckoutSuccessPage({ searchParams }: CheckoutSuccessPageProps) {
  const resolvedSearchParams = await searchParams
  const cartId = resolveCartId(resolvedSearchParams)
  const customWhatsApp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER

  const whatsappMessage = cartId ? `Orden ${cartId}` : 'Orden sin referencia'
  const whatsappLink = buildWhatsAppLink(whatsappMessage, customWhatsApp)

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="flex w-full max-w-2xl flex-col items-center space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Pago aprobado</h1>
        <p className="text-lg text-gray-600">
          Tu transaccion se registro correctamente. Te confirmaremos el despacho por WhatsApp o correo.
        </p>
        {cartId && (
          <div className="w-full space-y-4 text-left">
            <p className="text-sm text-gray-500 text-center sm:text-left">
              Referencia de carrito:{' '}
              <span className="font-mono font-semibold">{cartId}</span>
            </p>
            <CartSummary cartId={cartId} />
          </div>
        )}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/" className="sm:w-auto">
            <Button className="w-full sm:w-auto">Volver</Button>
          </Link>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="sm:w-auto"
          >
            <Button className="w-full sm:w-auto" variant="outline">
              Confirmar por WhatsApp
            </Button>
          </a>
        </div>
      </div>
    </main>
  )
}
