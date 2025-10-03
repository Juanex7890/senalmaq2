'use client'

import Link from 'next/link'
import { 
  Instagram, 
  Youtube, 
  MessageCircle, 
  Phone, 
  Mail, 
  MapPin,
  Shield,
  Truck,
  RotateCcw
} from 'lucide-react'

interface FooterProps {
  siteMedia?: {
    instagramUrl: string
    youtubeUrl: string
    whatsappUrl: string
  }
}

export function Footer({ siteMedia }: FooterProps) {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    company: [
      { name: 'Sobre nosotros', href: '/sobre-nosotros' },
      { name: 'Contacto', href: '/contacto' },
      { name: 'Política de privacidad', href: '/privacidad' },
      { name: 'Términos y condiciones', href: '/terminos' },
    ],
    support: [
      { name: 'Centro de ayuda', href: '/ayuda' },
      { name: 'Guías de compra', href: '/guias' },
      { name: 'Garantía', href: '/garantia' },
      { name: 'Devoluciones', href: '/devoluciones' },
      { name: 'Soporte técnico', href: '/soporte' },
    ],
  }

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">S</span>
              </div>
              <span className="text-xl font-bold">Senalmaq</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Especialistas en máquinas de coser industriales y para hogar. 
              Calidad, garantía y servicio técnico especializado.
            </p>
            
            {/* Trust Badges */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <Shield className="h-4 w-4 text-primary-400" />
                <span>Garantía oficial</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <Truck className="h-4 w-4 text-primary-400" />
                <span>Envío gratis</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <RotateCcw className="h-4 w-4 text-primary-400" />
                <span>Devoluciones fáciles</span>
              </div>
            </div>
          </div>

          {/* Company Links */}
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


          {/* Contact & Social */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contacto</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-primary-400" />
                <span className="text-sm text-gray-300">+34 123 456 789</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-primary-400" />
                <span className="text-sm text-gray-300">info@senalmaq.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-primary-400" />
                <span className="text-sm text-gray-300">Madrid, España</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="mt-6">
              <h4 className="font-medium mb-3">Síguenos</h4>
              <div className="flex space-x-3">
                <a
                  href={siteMedia?.instagramUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-800 rounded-lg hover:bg-primary-600 transition-colors"
                >
                  <Instagram className="h-4 w-4" />
                </a>
                <a
                  href={siteMedia?.youtubeUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-800 rounded-lg hover:bg-primary-600 transition-colors"
                >
                  <Youtube className="h-4 w-4" />
                </a>
                <a
                  href={siteMedia?.whatsappUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-800 rounded-lg hover:bg-primary-600 transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <p className="text-sm text-gray-400">
              © {currentYear} Senalmaq. Todos los derechos reservados.
            </p>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <Link href="/privacidad" className="hover:text-white transition-colors">
                Privacidad
              </Link>
              <Link href="/terminos" className="hover:text-white transition-colors">
                Términos
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
