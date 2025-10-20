import Link from 'next/link'

import { CheckCircle2, MessageCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  buildWhatsAppLink,
  getSingleSearchParam,
  resolveCartId,
  type SearchParams,
} from '../utils'
import { CartSummary } from '../components/cart-summary'
import { OrderStatusWatcher } from '../components/order-status-watcher'

interface CheckoutSuccessPageProps {
  searchParams: Promise<SearchParams>
}

const resolveOrderId = (params: SearchParams) => {
  return (
    getSingleSearchParam(params, 'orderId') ??
    resolveCartId(params) ??
    getSingleSearchParam(params, 'reference') ??
    'sin-referencia'
  )
}

export default async function CheckoutSuccessPage({ searchParams }: CheckoutSuccessPageProps) {
  const resolvedParams = await searchParams
  const cartId = resolveCartId(resolvedParams)
  const orderId = resolveOrderId(resolvedParams)

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER
  const whatsappMessage = `Hola 👋 Tengo la orden ${orderId}. ¿Podemos coordinar el envío?`
  const whatsappLink = buildWhatsAppLink(whatsappMessage, whatsappNumber)

  return (
    <main className="relative flex min-h-[70vh] w-full items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-emerald-100 px-4 py-16">
      <OrderStatusWatcher orderId={orderId} cartId={cartId} />
      <div className="flex w-full max-w-3xl flex-col gap-8 rounded-2xl border border-white/60 bg-white/90 p-8 shadow-xl backdrop-blur">
        <header className="flex flex-col items-center gap-4 text-center">
          <span className="inline-flex items-center justify-center rounded-full bg-emerald-100 p-4 shadow-inner">
            <CheckCircle2 className="h-12 w-12 text-emerald-500" aria-hidden="true" />
          </span>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              ¡Gracias por tu compra!
            </h1>
            <p className="max-w-xl text-base text-gray-600 sm:text-lg">
              Gracias por tu compra — contáctanos por WhatsApp para coordinar el envío de tu pedido.
              Nuestro equipo está listo para ayudarte.
            </p>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-emerald-100 bg-white p-5 text-center shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
              Orden
            </p>
            <p className="mt-2 font-mono text-sm font-semibold text-gray-900">{orderId}</p>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-white p-5 text-center shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
              Estado
            </p>
            <p className="mt-2 text-sm font-medium text-gray-900">Pendiente de confirmación</p>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-white p-5 text-center shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
              Envío
            </p>
            <p className="mt-2 text-sm text-gray-900">Coordinaremos contigo por WhatsApp</p>
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-slate-100 bg-white/90 p-6 shadow-inner">
          <header className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Resumen del pedido</h2>
            {cartId && (
              <span className="text-sm text-gray-500">
                Carrito:{' '}
                <span className="font-mono font-medium text-gray-800">{cartId}</span>
              </span>
            )}
          </header>
          {cartId ? (
            <CartSummary cartId={cartId} />
          ) : (
            <p className="text-sm text-gray-500">
              No encontramos los detalles del carrito. Si necesitas asistencia, comunícate con
              nosotros por WhatsApp.
            </p>
          )}
          <p className="text-xs text-gray-400">
            * El botón de WhatsApp nos ayuda a confirmar tu pago y coordinar la entrega.
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
              <MessageCircle className="mr-2 h-4 w-4" />
              Escribir por WhatsApp
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
