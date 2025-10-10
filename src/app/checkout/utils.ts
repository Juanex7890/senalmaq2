export type SearchParams = Record<string, string | string[] | undefined>

export const DEFAULT_WHATSAPP = '+57 317 669 3030'

export const sanitizePhoneNumber = (value: string) => value.replace(/[^\d]/g, '')

export const resolveCartId = (searchParams: SearchParams) => {
  const candidates = [
    'cartId',
    'external_reference',
    'externalReference',
    'preference_id',
    'collection_id',
  ]

  for (const key of candidates) {
    const value = searchParams[key]
    if (!value) {
      continue
    }

    if (Array.isArray(value)) {
      const first = value.find(Boolean)
      if (first) {
        return first
      }
    } else if (typeof value === 'string' && value.length > 0) {
      return value
    }
  }

  return undefined
}

export const buildWhatsAppLink = (message: string, phone?: string) => {
  const targetNumber = sanitizePhoneNumber(phone ?? DEFAULT_WHATSAPP)
  return `https://wa.me/${targetNumber}?text=${encodeURIComponent(message)}`
}
