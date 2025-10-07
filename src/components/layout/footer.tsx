'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Instagram,
  Youtube,
  Phone,
  Mail,
  MapPin,
  Shield,
  Truck,
  RotateCcw,
} from 'lucide-react'

import { mapSocialDataToSiteMedia, type SiteMedia } from '@/lib/actions/media'
import { mapSocialDocument, subscribeToSocial } from '@/lib/firebase'

type FooterSocialLinks = Pick<SiteMedia, 'instagramUrl' | 'youtubeUrl' | 'tiktokUrl' | 'whatsappUrl'>

const extractSocialLinks = (data?: Partial<SiteMedia>): FooterSocialLinks => ({
  instagramUrl: data?.instagramUrl ?? '',
  youtubeUrl: data?.youtubeUrl ?? '',
  tiktokUrl: data?.tiktokUrl ?? '',
  whatsappUrl: data?.whatsappUrl ?? '',
})

interface FooterProps {
  siteMedia?: Partial<SiteMedia>
  contactInfo?: {
    phone: string
    whatsapp1: string
    whatsapp2: string
    email: string
    address: string
  }
}

export function Footer({ siteMedia, contactInfo }: FooterProps) {
  const currentYear = new Date().getFullYear()
  const [socialLinks, setSocialLinks] = useState<FooterSocialLinks>(() => extractSocialLinks(siteMedia))

  useEffect(() => {
    setSocialLinks(extractSocialLinks(siteMedia))
  }, [siteMedia])

  useEffect(() => {
    let isMounted = true

    const unsubscribe = subscribeToSocial(
      (snapshot) => {
        if (!snapshot.exists()) {
          if (isMounted) {
            setSocialLinks(extractSocialLinks(undefined))
          }
          return
        }

        const mapped = mapSocialDataToSiteMedia(mapSocialDocument(snapshot))
        if (isMounted) {
          setSocialLinks(extractSocialLinks(mapped))
        }
      },
      (error) => {
        console.error('Error syncing footer social links:', error)
      }
    )

    return () => {
      isMounted = false
      if (typeof unsubscribe === 'function') {
        unsubscribe()
      }
    }
  }, [])

  const footerLinks = {
    company: [
      { name: 'Sobre nosotros', href: '/sobre-nosotros' },
      { name: 'Contacto', href: '/contacto' },
      { name: 'Politica de privacidad', href: '/privacidad' },
      { name: 'Terminos y condiciones', href: '/terminos' },
    ],
    support: [
      { name: 'Centro de ayuda', href: '/ayuda' },
      { name: 'Guias de compra', href: '/guias' },
      { name: 'Garantia', href: '/garantia' },
      { name: 'Devoluciones', href: '/devoluciones' },
      { name: 'Soporte tecnico', href: '/soporte' },
    ],
  }

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full overflow-hidden">
                <img
                  src="/images/logosenalmaq.png"
                  alt="Senalmaq Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xl font-bold">Senalmaq</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Especialistas en maquinas de coser industriales y para hogar.
              Calidad, garantia y servicio tecnico especializado.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <Shield className="h-4 w-4 text-primary-400" />
                <span>Garantia oficial</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <Truck className="h-4 w-4 text-primary-400" />
                <span>Envios a toda Colombia</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Empresa</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Contacto</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-primary-400" />
                <span className="text-sm text-gray-300">{contactInfo?.phone || '+57 317 669 3030'}</span>
              </div>
               <a
                 href={`https://wa.me/${(contactInfo?.whatsapp1 || '+57 317 669 3030').replace(/[^\d]/g, '')}`}
                 target="_blank"
                 rel="noopener noreferrer"
                 className="flex items-center space-x-3 hover:text-green-400 transition-colors"
               >
                 <svg className="h-4 w-4 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                   <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                 </svg>
                 <span className="text-sm text-gray-300">{contactInfo?.whatsapp1 || '+57 317 669 3030'}</span>
               </a>
               <a
                 href={`https://wa.me/${(contactInfo?.whatsapp2 || '+57 318 296 9963').replace(/[^\d]/g, '')}`}
                 target="_blank"
                 rel="noopener noreferrer"
                 className="flex items-center space-x-3 hover:text-green-400 transition-colors"
               >
                 <svg className="h-4 w-4 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                   <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                 </svg>
                 <span className="text-sm text-gray-300">{contactInfo?.whatsapp2 || '+57 318 296 9963'}</span>
               </a>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-primary-400" />
                <span className="text-sm text-gray-300">{contactInfo?.email || 'info@senalmaq.com'}</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-primary-400" />
                <span className="text-sm text-gray-300">{contactInfo?.address || 'Cra 108a # 139-05 / Calle 139 # 103f 13, Suba, Bogota, Colombia.'}</span>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-medium mb-3">Siguenos</h4>
              <div className="flex space-x-3">
                <a
                  href={socialLinks.instagramUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-800 rounded-lg hover:bg-primary-600 transition-colors"
                >
                  <Instagram className="h-4 w-4" />
                </a>
                <a
                  href={socialLinks.youtubeUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-800 rounded-lg hover:bg-primary-600 transition-colors"
                >
                  <Youtube className="h-4 w-4" />
                </a>
                <a
                  href={socialLinks.whatsappUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-800 rounded-lg hover:bg-green-600 transition-colors"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                </a>
                <a
                  href={socialLinks.tiktokUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-800 rounded-lg hover:bg-pink-600 transition-colors"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <p className="text-sm text-gray-400">&copy; {currentYear} Senalmaq. Todos los derechos reservados.</p>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <Link href="/privacidad" className="hover:text-white transition-colors">
                Politica de privacidad
              </Link>
              <Link href="/terminos" className="hover:text-white transition-colors">
                Terminos
              </Link>
              <Link href="/cookies" className="hover:text-white transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
