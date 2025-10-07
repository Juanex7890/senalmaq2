import { getSocialDoc, mapSocialDocument, SocialData } from '@/lib/firebase'
import { getDoc } from 'firebase/firestore'

export interface SiteMedia {
  heroHeadline?: string
  heroSub?: string
  youtubeMainId: string
  youtubeShortIds: string[]
  instagramUrl: string
  youtubeUrl: string
  tiktokUrl: string
  whatsappUrl: string
  heroImages: string[]
}

export const mapSocialDataToSiteMedia = (socialData: SocialData): SiteMedia => ({
  heroHeadline: 'Maquinas de Coser de Calidad Profesional',
  heroSub:
    'Descubre nuestra amplia gama de maquinas de coser industriales y para hogar. Calidad, garantia y servicio tecnico especializado.',
  youtubeMainId: socialData.videoId ?? '',
  youtubeShortIds: Array.isArray(socialData.shorts) ? socialData.shorts : [],
  instagramUrl: socialData.instagram ?? '',
  youtubeUrl: socialData.youtube ?? '',
  tiktokUrl: socialData.tiktok ?? '',
  whatsappUrl: socialData.whatsapp ?? '',
  heroImages: Array.isArray(socialData.heroImages) ? socialData.heroImages : [],
})

export async function getSiteMedia(): Promise<SiteMedia | null> {
  try {
    const socialDocRef = getSocialDoc()
    const snapshot = await getDoc(socialDocRef)

    if (!snapshot.exists()) {
      return null
    }

    const socialData = mapSocialDocument(snapshot)
    return mapSocialDataToSiteMedia(socialData)
  } catch (error) {
    console.error('Error fetching site media:', error)
    return null
  }
}
