import React from 'react'
import assert from 'assert'
import { renderToStaticMarkup } from 'react-dom/server'
import { PriceOrConsult } from '../src/components/PriceOrConsult'

process.env.NEXT_PUBLIC_WHATSAPP_NUMBER = '+573001112233'

const consultProduct = {
  name: 'Maquina industrial',
  slug: 'maquina-industrial',
  price: 0,
  compareAtPrice: undefined,
  consultRequired: true,
  consultNote: 'Precio variable por configuracion',
}

const consultHtml = renderToStaticMarkup(
  <PriceOrConsult product={consultProduct} />
)

assert(consultHtml.includes('Consultar con un asesor'), 'Consult label missing')
assert(consultHtml.includes('Hablar por WhatsApp'), 'WhatsApp button missing')
assert(!consultHtml.includes('$'), 'Price should not render for consult products')

const standardProduct = {
  name: 'Maquina basica',
  slug: 'maquina-basica',
  price: 1250000,
  compareAtPrice: 1500000,
  consultRequired: false,
  consultNote: undefined,
}

const standardHtml = renderToStaticMarkup(
  <PriceOrConsult product={standardProduct} />
)

assert(standardHtml.includes('1.250.000') || standardHtml.includes('1250000'), 'Price not rendered for standard product')
assert(!standardHtml.includes('Hablar por WhatsApp'), 'WhatsApp button should not render for standard product')

console.log('PriceOrConsult tests passed')
