export const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.senalmaq.com'

export const toAbs = (u?: string) => {
  if (!u) return undefined
  if (u.startsWith('http')) return u
  return new URL(u, BASE).toString()
}

const toFirebaseDownloadUrl = (u?: string) => {
  if (!u) return undefined
  // accept gs://, storage.googleapis URLs, or paths
  if (u.startsWith('gs://')) return undefined // leave undefined so we fallback
  let out = u
  if (out.startsWith('/')) out = toAbs(out)!
  if (out.includes('firebasestorage.googleapis.com') && !out.includes('alt=media')) {
    out += (out.includes('?') ? '&' : '?') + 'alt=media'
  }
  return out
}

export const resolveOgImage = (arr?: string[] | string, fallback = '/og-default.jpg') => {
  const first = Array.isArray(arr) ? arr[0] : arr
  return toFirebaseDownloadUrl(first) || toAbs(fallback)!
}

export { toFirebaseDownloadUrl }
