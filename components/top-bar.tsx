'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CommandMenu } from '@/components/command-menu'
import { useSession, signIn, signOut } from 'next-auth/react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { LogOut } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function TopBar() {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status !== 'loading') {
      setIsLoading(false)
    }
  }, [status])

  return (
    <div className="fixed top-0 left-0 right-0 z-50 border-b bg-[#0D1117] border-zinc-800">
      <div className="flex items-center h-14 px-4 gap-4 max-w-[1920px] mx-auto">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <Image
            src="/logo.svg"
            alt="Grovekeeper"
            width={24}
            height={24}
            className="w-6 h-6"
          />
          <div className="flex items-center gap-2">
            GROVEKEEPER
            <span className="text-xs px-1.5 py-0.5 bg-[#00E6B4]/10 text-[#00E6B4] rounded-md font-medium">BETA</span>
          </div>
        </Link>
        
        <div className="flex-1 w-full ml-8">
          <CommandMenu />
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <Button variant="ghost" className="text-zinc-400 hover:text-white">
            English
          </Button>
          
          {isLoading ? (
            <Button variant="ghost" className="relative h-10 w-10 p-0 rounded-full overflow-hidden border border-zinc-800">
              <div className="w-full h-full rounded-full bg-zinc-800 animate-pulse" />
            </Button>
          ) : session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 p-0 rounded-full overflow-hidden border border-zinc-800">
                  <div className="w-full h-full rounded-full overflow-hidden">
                    <Image
                      src={session.user.image || '/avatar-placeholder.png'}
                      alt={session.user.name || 'User avatar'}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                      priority
                    />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 bg-[#161B22] border-zinc-800 p-2">
                <div className="flex items-center gap-3 p-2">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-white">{session.user.name}</span>
                    <span className="text-xs text-zinc-400">{session.user.email}</span>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()} className="text-red-500 hover:text-red-400 flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              onClick={() => signIn('discord')}
              className="bg-[#00E6B4] text-black hover:bg-[#1BECA0] font-semibold flex items-center gap-2"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              Login with Discord
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

