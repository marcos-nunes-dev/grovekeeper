import '@/styles/globals.css'
import { GeistSans } from 'geist/font/sans'
import TopBar from '@/components/top-bar'
import Navigation from '@/components/navigation'
import { TooltipProvider } from '@/components/ui/tooltip'

export const metadata = {
  title: 'Grovekeeper - Albion Online Composition Builder',
  description: 'Create and discover powerful team compositions for Albion Online',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${GeistSans.className} bg-[#0A0E14] text-zinc-300 antialiased`}>
        <TooltipProvider>
          <TopBar />
          <Navigation />
          <main className="pt-[120px]">
            {children}
          </main>
        </TooltipProvider>
      </body>
    </html>
  )
}

