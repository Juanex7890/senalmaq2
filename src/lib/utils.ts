import { type ClassValue, clsx } from 'clsx'

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

export function getImageUrl(path: string): string {
  // If it's already a full URL, return as is
  if (path.startsWith('http')) return path
  
  // If it's a relative path or just a filename, assume it's an external URL
  // You can modify this logic based on where your images are hosted
  if (path.startsWith('/')) return path
  
  // For now, return the path as is (assuming it's a complete URL)
  return path
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
