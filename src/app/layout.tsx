import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Inter } from 'next/font/google'
import './globals.css'
import { SmoothToast } from '@/components/ui/smooth-toast'
import { ConnectionStatus } from '@/components/ui/connection-status'
import { CartProvider } from '@/components/cart/cart-provider'

const inter = Inter({ subsets: ['latin'] })
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.senalmaq.com'
const metadataDescription =
  'Maquinas de coser industriales, repuestos y soporte especializado para talleres y hogar en Colombia.'
const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
const bingVerification = process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
const yandexVerification = process.env.NEXT_PUBLIC_YANDEX_SITE_VERIFICATION
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Senalmaq',
  url: siteUrl,
  logo: new URL('/logo-512.png', siteUrl).toString(),
}

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Senalmaq | Maquinas de coser y soluciones textiles',
    template: '%s | Senalmaq',
  },
  description: metadataDescription,
  keywords: [
    'maquinas de coser',
    'maquinaria textil',
    'senalmaq',
    'repuestos de costura',
  ],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'es_CO',
    url: '/',
    siteName: 'Senalmaq',
    title: 'Senalmaq | Maquinas de coser y soluciones textiles',
    description: metadataDescription,
    images: [
      {
        url: '/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'Senalmaq',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Senalmaq | Maquinas de coser y soluciones textiles',
    description: metadataDescription,
    images: ['/og-default.jpg'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/logo-512.png', type: 'image/png', sizes: '512x512' },
    ],
    shortcut: ['/favicon.ico'],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  verification: {
    ...(googleVerification ? { google: googleVerification } : {}),
    ...(bingVerification ? { bing: bingVerification } : {}),
    ...(yandexVerification ? { yandex: yandexVerification } : {}),
  },
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="es" className="h-full" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className={`${inter.className} h-full antialiased`}>
        <CartProvider>
          {children}
          <SmoothToast />
          <ConnectionStatus />
        </CartProvider>
      </body>
    </html>
  )
}
