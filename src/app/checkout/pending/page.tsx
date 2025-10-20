import Link from 'next/link'

import { Button } from '@/components/ui/button'

import { buildWhatsAppLink, resolveCartId, type SearchParams } from '../utils'

interface CheckoutPendingPageProps {
  searchParams: Promise<SearchParams>
}

export default async function CheckoutPendingPage({ searchParams }: CheckoutPendingPageProps) {
  const resolvedSearchParams = await searchParams
  const cartId = resolveCartId(resolvedSearchParams)
  const whatsappMessage = cartId
    ? `Hola 👋 Mi orden ${cartId} aparece como pendiente. ¿Me ayudas a confirmarla?`
    : 'Hola 👋 Mi pago aparece como pendiente. ¿Me ayudas a confirmarlo?'
  const whatsappLink = buildWhatsAppLink(whatsappMessage, process.env.NEXT_PUBLIC_WHATSAPP_NUMBER)

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="max-w-xl space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Pago pendiente</h1>
        <p className="text-lg text-gray-600">
          Estamos validando tu pago con Bold. Te avisaremos en cuanto recibamos la confirmación.
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
              Escribir por WhatsApp
            </Button>
          </a>
        </div>
      </div>
    </main>
  )
}
