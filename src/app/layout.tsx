import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SmoothToast } from '@/components/ui/smooth-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Senalmaq - Máquinas de Coser Industriales y Hogar',
    template: '%s | Senalmaq'
  },
  description: 'Encuentra las mejores máquinas de coser industriales y para hogar en Senalmaq. Amplio catálogo de productos, garantía y envío gratis.',
  keywords: 'máquinas de coser, industrial, hogar, singer, fileteadoras, cortadoras, planchas',
  authors: [{ name: 'Senalmaq' }],
  creator: 'Senalmaq',
  publisher: 'Senalmaq',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://senalmaq.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: '/',
    siteName: 'Senalmaq',
    title: 'Senalmaq - Máquinas de Coser Industriales y Hogar',
    description: 'Encuentra las mejores máquinas de coser industriales y para hogar en Senalmaq. Amplio catálogo de productos, garantía y envío gratis.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Senalmaq - Máquinas de Coser',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Senalmaq - Máquinas de Coser Industriales y Hogar',
    description: 'Encuentra las mejores máquinas de coser industriales y para hogar en Senalmaq. Amplio catálogo de productos, garantía y envío gratis.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="h-full" suppressHydrationWarning>
      <body className={`${inter.className} h-full antialiased`}>
        {children}
        <SmoothToast />
      </body>
    </html>
  )
}