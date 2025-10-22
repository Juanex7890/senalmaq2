import React, { ReactNode } from 'react'
import { MessageCircle } from 'lucide-react'
import { Product } from '@/lib/types'
import { cn, formatPrice } from '@/lib/utils'
import { buildWhatsAppLink } from '@/lib/whatsapp'

type PriceLikeProduct = Pick<
  Product,
  'name' | 'slug' | 'price' | 'compareAtPrice' | 'consultRequired' | 'consultNote'
>

type PriceOrConsultProps = {
  product: PriceLikeProduct
  whatsappUrl?: string | null
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
  whatsappUrl,
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
    const waLink = buildWhatsAppLink(product, { whatsappUrl })
    const buttonClasses = cn(
      'flex w-full items-center justify-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm font-semibold text-green-700 transition hover:bg-green-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 pointer-events-auto',
      !waLink && 'opacity-60 cursor-not-allowed',
      buttonClassName,
    )

    return (
      <div className={cn('flex flex-col gap-2', className)}>
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
          aria-label={`Contactar por WhatsApp sobre ${product.name}`}
          title={waLink ? undefined : 'Configura NEXT_PUBLIC_WHATSAPP_NUMBER'}
          tabIndex={waLink ? 0 : -1}
          aria-disabled={!waLink}
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          Contactar con un asesor
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
