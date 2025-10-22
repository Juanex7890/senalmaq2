type ProductSummary = {
  name: string
  slug?: string | null
}

export function buildWhatsAppLink(product: ProductSummary) {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim() ?? ''
  const safeName = product.name?.trim() ?? ''
  const safeSlug = product.slug?.toString().trim() ?? ''

  const messageParts = ['Hola, quiero consultar el producto:']
  if (safeName) {
    messageParts.push(` ${safeName}`)
  }
  if (safeSlug) {
    messageParts.push(` (${safeSlug})`)
  }

  const message = messageParts.join('').trim()
  if (!phone) {
    return null
  }

  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/${phone}?text=${encodedMessage}`
}
