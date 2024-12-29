'use client'

import TopBar from '@/components/top-bar'
import Navigation from '@/components/navigation'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Providers } from './providers'
import AuthProvider from '@/components/auth-provider'
import { Toaster } from 'sonner'
import { ToastProvider } from '@/components/providers/toast-provider'
import { Heart, Linkedin } from 'lucide-react'
import { useApiWarmUp } from '@/lib/hooks/useApiWarmUp'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useApiWarmUp()

  return (
    <div className="bg-[#0A0E14] text-zinc-300 antialiased min-h-full flex flex-col">
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
    </div>
  )
} 