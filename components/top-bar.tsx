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
          GROVEKEEPER
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
              className="bg-[#00E6B4] text-black hover:bg-[#1BECA0] font-semibold"
            >
              Login with Discord
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

