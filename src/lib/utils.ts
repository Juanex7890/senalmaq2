import { type ClassValue, clsx } from 'clsx'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://www.senalmaq.com')
const DEFAULT_IMAGE_PATH = '/og-default.jpg'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(price)
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function createSearchTokens(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

const ensureLeadingSlash = (value: string) => (value.startsWith('/') ? value : `/${value}`)

export function getImageUrl(path?: string | null): string {
  const fallback = `${siteUrl}${ensureLeadingSlash(DEFAULT_IMAGE_PATH)}`
  if (!path || typeof path !== 'string') {
    return fallback
  }

  const trimmed = path.trim()
  if (!trimmed) {
    return fallback
  }

  try {
    const url = new URL(trimmed, siteUrl)
    return url.toString()
  } catch {
    return `${siteUrl}${ensureLeadingSlash(trimmed)}`
  }
}

export function getYouTubeEmbedUrl(videoId: string, isShort = false): string {
  if (isShort) {
    return `https://www.youtube.com/embed/${videoId}?autoplay=0&mute=1&controls=1&showinfo=0&rel=0&modestbranding=1`
  }
  return `https://www.youtube.com/embed/${videoId}?autoplay=0&mute=1&controls=1&showinfo=0&rel=0&modestbranding=1`
}

export function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
}
