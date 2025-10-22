import React from "react"
import assert from "assert"
import { renderToStaticMarkup } from "react-dom/server"
import { PriceOrConsult } from "../src/components/PriceOrConsult"

process.env.NEXT_PUBLIC_WHATSAPP_NUMBER = "+573001112233"

const consultProduct = {
  name: "Maquina industrial",
  slug: "maquina-industrial",
  price: 0,
  compareAtPrice: undefined,
  consultRequired: true,
  consultNote: "Precio variable por configuracion",
}

const consultHtml = renderToStaticMarkup(
  <PriceOrConsult product={consultProduct} />
)


assert(consultHtml.includes("Contactar con un asesor"), "WhatsApp button missing")
assert(!consultHtml.includes("$"), "Price should not render for consult products")

const standardProduct = {
  name: "Maquina basica",
  slug: "maquina-basica",
  price: 1250000,
  compareAtPrice: 1500000,
  consultRequired: false,
  consultNote: undefined,
}

const standardHtml = renderToStaticMarkup(
  <PriceOrConsult product={standardProduct} />
)

assert(standardHtml.includes("1.250.000") || standardHtml.includes("1250000"), "Price not rendered for standard product")
assert(!standardHtml.includes("Contactar con un asesor"), "WhatsApp button should not render for standard product")

const customUrlHtml = renderToStaticMarkup(
  <PriceOrConsult product={consultProduct} whatsappUrl="https://wa.me/573000000000" />
)

const hrefMatch = customUrlHtml.match(/href="([^"]+)"/)
assert(hrefMatch, "Custom WhatsApp base URL missing")
const hrefValue = hrefMatch![1]
const messageParam = hrefValue.split("text=")[1]
assert(messageParam, "Custom WhatsApp message missing encoded text")
const decodedMessage = decodeURIComponent(messageParam.replace(/\+/g, " "))
assert(decodedMessage.includes("Maquina industrial"), "Decoded WhatsApp message missing product name")

