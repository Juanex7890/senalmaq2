import { 
  getSocialDoc, 
  mapSocialDocument, 
  SocialData 
} from '@/lib/firebase';
import { getDoc } from 'firebase/firestore';

export interface SiteMedia extends SocialData {
  heroHeadline?: string;
  heroSub?: string;
  youtubeMainId?: string;
  youtubeShortIds?: string[];
  instagramUrl?: string;
  youtubeUrl?: string;
  whatsappUrl?: string;
  heroImages?: string[];
}

export async function getSiteMedia(): Promise<SiteMedia | null> {
  try {
    const socialDocRef = getSocialDoc();
    const snapshot = await getDoc(socialDocRef);
    
    if (!snapshot.exists()) {
      return null;
    }
    
    const socialData = mapSocialDocument(snapshot);
    
    // Transform social data to site media format
    return {
      ...socialData,
      youtubeMainId: socialData.videoId,
      youtubeShortIds: socialData.shorts,
      instagramUrl: socialData.instagram,
      youtubeUrl: socialData.youtube,
      heroHeadline: 'Máquinas de Coser de Calidad Profesional',
      heroSub: 'Descubre nuestra amplia gama de máquinas de coser industriales y para hogar. Calidad, garantía y servicio técnico especializado.',
      heroImages: socialData.heroImages || []
    };
  } catch (error) {
    console.error('Error fetching site media:', error);
    return null;
  }
}
