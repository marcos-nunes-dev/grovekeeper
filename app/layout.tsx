import '@/styles/globals.css'
import { GeistSans } from 'geist/font/sans'
import TopBar from '@/components/top-bar'
import Navigation from '@/components/navigation'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Providers } from './providers'
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import AuthProvider from '@/components/auth-provider'
import { Toaster } from 'sonner'
import { ToastProvider } from '@/components/providers/toast-provider'
import { Heart, Linkedin } from 'lucide-react'

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
    google: 'your-google-verification-code', // You'll need to add this
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark h-full">
      <body className={`${GeistSans.className} bg-[#0A0E14] text-zinc-300 antialiased min-h-full flex flex-col`}>
        <Providers>
          <AuthProvider>
            <TooltipProvider>
              <TopBar />
              <Navigation />
              <main className="pt-[120px] flex-1">
                {children}
              </main>
              <footer className="py-8 px-4 border-t border-[#00A884]/10 bg-[#0A0E14] mt-auto">
                <div className="container mx-auto">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <Heart className="h-5 w-5 text-[#00A884]" />
                      <p className="text-sm text-zinc-400">
                        Made with love by Marcos Nunes
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <a
                        href="https://www.linkedin.com/in/marcos-renato-nunes/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-zinc-400 hover:text-[#00A884] transition-colors"
                      >
                        <Linkedin className="h-5 w-5" />
                        <span className="sr-only">LinkedIn</span>
                      </a>
                      <span className="text-sm text-zinc-400">
                        Discord: marcosnunes_
                      </span>
                    </div>
                  </div>
                </div>
              </footer>
              <Toaster />
              <ToastProvider />
            </TooltipProvider>
          </AuthProvider>
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}

