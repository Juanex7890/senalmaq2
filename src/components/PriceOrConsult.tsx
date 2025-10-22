import React, { ReactNode } from 'react'
import { Product } from '@/lib/types'
import { cn, formatPrice } from '@/lib/utils'
import { buildWhatsAppLink } from '@/lib/whatsapp'

type PriceLikeProduct = Pick<
  Product,
  'name' | 'slug' | 'price' | 'compareAtPrice' | 'consultRequired' | 'consultNote'
>

type PriceOrConsultProps = {
  product: PriceLikeProduct
  className?: string
  priceClassName?: string
  comparePriceClassName?: string
  consultationLabelClassName?: string
  noteClassName?: string
  buttonClassName?: string
  layout?: 'inline' | 'stack'
  extraContent?: ReactNode
}

export function PriceOrConsult({
  product,
  className,
  priceClassName,
  comparePriceClassName,
  consultationLabelClassName,
  noteClassName,
  buttonClassName,
  layout = 'stack',
  extraContent,
}: PriceOrConsultProps) {
  if (product.consultRequired) {
    const waLink = buildWhatsAppLink(product)
    const labelClasses =
      consultationLabelClassName ??
      'text-base font-semibold text-amber-700 leading-tight'
    const buttonClasses = cn(
      'inline-flex items-center justify-center rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm font-semibold text-green-700 transition hover:bg-green-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2',
      !waLink && 'pointer-events-none opacity-60 cursor-not-allowed',
      buttonClassName,
    )

    return (
      <div className={cn('flex flex-col gap-2', className)}>
        <span className={labelClasses}>Consultar con un asesor</span>
        {product.consultNote ? (
          <p className={cn('text-sm text-slate-600', noteClassName)}>
            {product.consultNote}
          </p>
        ) : null}
        <a
          className={buttonClasses}
          href={waLink ?? '#'}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Consultar por WhatsApp sobre ${product.name}`}
          title={waLink ? undefined : 'Configura NEXT_PUBLIC_WHATSAPP_NUMBER'}
          tabIndex={waLink ? 0 : -1}
          aria-disabled={!waLink}
        >
          Hablar por WhatsApp
        </a>
        {extraContent}
      </div>
    )
  }

  const containerClass =
    layout === 'inline'
      ? 'flex items-baseline gap-2'
      : 'flex flex-col gap-2'

  return (
    <div className={cn(containerClass, className)}>
      <span className={cn('font-bold text-gray-900 text-lg', priceClassName)}>
        {formatPrice(product.price)}
      </span>
      {product.compareAtPrice ? (
        <span
          className={cn(
            'text-sm text-gray-500 line-through',
            comparePriceClassName,
          )}
        >
          {formatPrice(product.compareAtPrice)}
        </span>
      ) : null}
      {extraContent}
    </div>
  )
}

export default PriceOrConsult
