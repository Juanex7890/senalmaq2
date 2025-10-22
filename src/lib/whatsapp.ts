type ProductSummary = {
  name: string
  slug?: string | null
}

type WhatsAppLinkOptions = {
  whatsappUrl?: string | null
  phoneNumber?: string | null
}

let runtimeWhatsappUrl: string | null = null
type WhatsappListener = (url: string | null) => void
const runtimeListeners = new Set<WhatsappListener>()

export function setRuntimeWhatsappUrl(url?: string | null) {
  const nextValue = typeof url === 'string' && url.trim().length > 0 ? url.trim() : null
  if (nextValue === runtimeWhatsappUrl) {
    return
  }
  runtimeWhatsappUrl = nextValue
  runtimeListeners.forEach((listener) => {
    try {
      listener(runtimeWhatsappUrl)
    } catch (error) {
      console.error('Error notifying WhatsApp runtime listener', error)
    }
  })
}

export function getRuntimeWhatsappUrl() {
  return runtimeWhatsappUrl
}

export function subscribeRuntimeWhatsapp(listener: WhatsappListener) {
  runtimeListeners.add(listener)
  return () => {
    runtimeListeners.delete(listener)
  }
}

const sanitizePhone = (input: string) => {
  const normalized = input.trim()
  if (!normalized) {
    return ''
  }
  const digits = normalized.replace(/[^\d+]/g, '')
  return digits.startsWith('+') ? digits.slice(1) : digits
}

const buildUrlWithMessage = (baseUrl: string, message: string) => {
  try {
    const parsed = new URL(baseUrl)
    const encoded = message

    if (parsed.searchParams.has('text')) {
      parsed.searchParams.set('text', encoded)
    } else if (parsed.searchParams.has('body')) {
      parsed.searchParams.set('body', encoded)
    } else {
      parsed.searchParams.set('text', encoded)
    }

    return parsed.toString()
  } catch {
    return null
  }
}

export function buildWhatsAppLink(product: ProductSummary, options?: WhatsAppLinkOptions) {
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
  const encodedMessage = encodeURIComponent(message)

  const candidateUrl = options?.whatsappUrl ?? runtimeWhatsappUrl
  if (candidateUrl) {
    const urlWithMessage = buildUrlWithMessage(candidateUrl, message)
    if (urlWithMessage) {
      return urlWithMessage
    }
  }

  const phoneSource =
    options?.phoneNumber ?? process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ''
  const sanitizedPhone = sanitizePhone(phoneSource)
  if (!sanitizedPhone) {
    return null
  }

  return `https://wa.me/${sanitizedPhone}?text=${encodedMessage}`
}
