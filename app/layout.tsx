import '@/styles/globals.css'
import { GeistSans } from 'geist/font/sans'
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import ClientLayout from './client-layout'

export const metadata = {
  metadataBase: new URL('https://grovekeeper.app'),
  title: 'Grovekeeper - Essential Tools for Albion Online Players',
  description: 'Powerful tools for Albion Online players: Regear Calculator, ZvZ Attendance Tracker, Player Profiles, and Build Creator. Optimize your gameplay with our comprehensive suite of tools.',
  keywords: 'albion online, albion tools, albion online api, albion regear calculator, albion zvz tracker, albion build creator, albion player profiles, albion online tools, albion online tracker',
  openGraph: {
    title: 'Grovekeeper - Essential Tools for Albion Online Players',
    description: 'Powerful tools for Albion Online players: Regear Calculator, ZvZ Attendance Tracker, Player Profiles, and Build Creator. Optimize your gameplay with our comprehensive suite of tools.',
    type: 'website',
    locale: 'en_US',
    url: 'https://grovekeeper.app',
    siteName: 'Grovekeeper',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Grovekeeper - Albion Online Tools'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Grovekeeper - Essential Tools for Albion Online Players',
    description: 'Powerful tools for Albion Online players: Regear Calculator, ZvZ Attendance Tracker, Player Profiles, and Build Creator.',
    images: ['/og-image.jpg'],
  },
  icons: {
    icon: '/logo.svg',
    shortcut: '/logo.svg',
    apple: '/logo.svg',
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
    <html lang="en" className="dark h-full">
      <body className={GeistSans.className}>
        <ClientLayout>
          {children}
        </ClientLayout>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}

