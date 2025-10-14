import Link from 'next/link'

import { Button } from '@/components/ui/button'

import { resolveCartId, type SearchParams } from '../utils'

interface CheckoutFailurePageProps {
  searchParams: Promise<SearchParams>
}

export default async function CheckoutFailurePage({ searchParams }: CheckoutFailurePageProps) {
  const resolvedSearchParams = await searchParams
  const cartId = resolveCartId(resolvedSearchParams)
  const whatsappMessage = cartId
    ? `Hola, mi orden ${cartId} fue rechazada. Puedo obtener ayuda para completar el pago?`
    : 'Hola, mi pago fue rechazado. Puedo obtener ayuda para completar la compra?'
  const whatsappLink = `https://wa.me/573001234567?text=${encodeURIComponent(whatsappMessage)}`

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="max-w-xl space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">No pudimos completar tu pago</h1>
        <p className="text-lg text-gray-600">
          El intento de pago fue rechazado. Puedes intentarlo nuevamente o escribenos y te ayudaremos a finalizar la compra.
        </p>
        {cartId && (
          <p className="text-sm text-gray-500">
            Referencia de carrito: <span className="font-mono font-semibold">{cartId}</span>
          </p>
        )}
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
