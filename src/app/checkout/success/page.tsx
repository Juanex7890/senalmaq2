import Link from 'next/link'

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

  const displayedExternalReference = externalReference ?? 'sin referencia'
  const displayedPaymentId = paymentId ?? 'sin referencia'
  const whatsappLink = `https://wa.me/573001234567?text=${encodeURIComponent(
    `Orden ${displayedExternalReference} (pago ${displayedPaymentId})`
  )}`

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="flex w-full max-w-2xl flex-col items-center space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Gracias por tu compra</h1>
        <p className="text-lg text-gray-600">
          Registramos tu pago correctamente. Apenas confirmemos el despacho te contactaremos por WhatsApp o correo.
        </p>
        <dl className="grid w-full gap-2 text-sm text-gray-600 sm:grid-cols-3">
          <div>
            <dt className="font-medium uppercase tracking-wide">Orden</dt>
            <dd className="font-mono text-gray-900">{displayedExternalReference}</dd>
          </div>
          <div>
            <dt className="font-medium uppercase tracking-wide">Pago</dt>
            <dd className="font-mono text-gray-900">{displayedPaymentId}</dd>
          </div>
          {status && (
            <div>
              <dt className="font-medium uppercase tracking-wide">Estado</dt>
              <dd className="capitalize text-gray-900">{status}</dd>
            </div>
          )}
        </dl>
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
              Contactar por WhatsApp
            </Button>
          </a>
          <a href="tel:+573001234567" className="sm:w-auto">
            <Button className="w-full sm:w-auto" variant="secondary">
              Llamar
            </Button>
          </a>
        </div>
      </div>
    </main>
  )
}
