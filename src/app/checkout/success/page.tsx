import Link from 'next/link'

import { CheckCircle2 } from 'lucide-react'

import { Button } from '@/components/ui/button'

import {
  getSingleSearchParam,
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
  const paymentId =
    getSingleSearchParam(resolvedSearchParams, 'payment_id') ??
    getSingleSearchParam(resolvedSearchParams, 'paymentId')
  const status =
    getSingleSearchParam(resolvedSearchParams, 'status') ??
    getSingleSearchParam(resolvedSearchParams, 'collection_status')
  const externalReference =
    getSingleSearchParam(resolvedSearchParams, 'external_reference') ??
    getSingleSearchParam(resolvedSearchParams, 'cartId')

  const displayedOrderId = externalReference ?? cartId ?? 'sin referencia'
  const displayedPaymentId = paymentId ?? 'sin referencia'
  const displayedStatus = status ?? 'procesando'

  const whatsappOrderRef = cartId ?? displayedOrderId
  const whatsappMessage = `Hola, mi orden ${whatsappOrderRef} (pago ${displayedPaymentId}). Podemos coordinar el envío?`
  const whatsappLink = `https://wa.me/573001234567?text=${encodeURIComponent(whatsappMessage)}`

  return (
    <main className="relative flex min-h-[70vh] w-full items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-sky-100 px-4 py-16">
      <div className="relative flex w-full max-w-4xl flex-col gap-8 rounded-2xl border border-white/50 bg-white/80 p-8 shadow-xl backdrop-blur">
        <section className="flex flex-col items-center gap-4 text-center">
          <span className="inline-flex items-center justify-center rounded-full bg-emerald-100/80 p-4 shadow-inner">
            <CheckCircle2 className="h-12 w-12 text-emerald-500" aria-hidden="true" />
          </span>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">¡Gracias por tu compra!</h1>
            <p className="max-w-xl text-base text-gray-600 sm:text-lg">
              Contáctanos por WhatsApp para poder realizar el envío de tu compra. Nuestro equipo está listo para ayudarte.
            </p>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-emerald-100 bg-white/90 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Orden</p>
            <p className="mt-2 font-mono text-sm text-gray-900">{displayedOrderId}</p>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-white/90 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Pago</p>
            <p className="mt-2 font-mono text-sm text-gray-900">{displayedPaymentId}</p>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-white/90 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Estado</p>
            <p className="mt-2 text-sm font-medium capitalize text-gray-900">{displayedStatus}</p>
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-slate-100 bg-white/90 p-6 shadow-inner">
          <header className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Resumen de tu pedido</h2>
            {cartId && (
              <span className="text-sm text-gray-500">
                Carrito: <span className="font-mono font-medium text-gray-800">{cartId}</span>
              </span>
            )}
          </header>
          {cartId ? (
            <CartSummary cartId={cartId} />
          ) : (
            <p className="text-sm text-gray-500">
              No encontramos los detalles del carrito. Si necesitas asistencia, comunícate con nosotros por WhatsApp.
            </p>
          )}
          <p className="text-xs text-gray-400">
            * El carrito se vaciará automáticamente una vez recibamos la confirmación definitiva del pago desde Mercado Pago.
          </p>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="sm:w-auto"
          >
            <Button className="w-full sm:w-auto bg-emerald-500 text-white hover:bg-emerald-600">
              Escribir por WhatsApp
            </Button>
          </a>
          <a href="tel:+573001234567" className="sm:w-auto">
            <Button className="w-full sm:w-auto" variant="secondary">
              Llamar
            </Button>
          </a>
          <Link href="/" className="sm:w-auto">
            <Button className="w-full sm:w-auto" variant="outline">
              Volver a la tienda
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
