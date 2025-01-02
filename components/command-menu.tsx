'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Calculator, Search, Users, Command, BookOpen, ArrowRight, User } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { CommandDialog, CommandGroup, CommandItem, CommandEmpty, CommandInput, CommandList, CommandShortcut, CommandSeparator } from './ui/command'


type ShortcutKey = 'k' | 'a' | 'r' | '/' | 'p'

export function CommandMenu() {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const shortcuts: Record<ShortcutKey, () => void> = {
      k: () => setOpen((open) => !open),
      a: () => router.push('/attendance'),
      r: () => router.push('/regear-calculator'),
      p: () => router.push('/profile'),
      '/': () => router.push('/docs'),
    }

    const down = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase() as ShortcutKey
      
      // Only Cmd+K works globally to open/close the palette
      if ((e.metaKey || e.ctrlKey) && key === 'k') {
        e.preventDefault()
        shortcuts[key]()
        return
      }

      // Other shortcuts only work when command palette is open and with Cmd/Ctrl
      if (open && (e.metaKey || e.ctrlKey) && key in shortcuts && key !== 'k') {
        e.preventDefault()
        setOpen(false)
        shortcuts[key]()
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [router, open])

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false)
    command()
  }, [])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative w-full flex items-center group"
      >
        <Input
          className="w-full pl-12 pr-4 py-2 bg-zinc-900/50 border-zinc-800 ring-offset-zinc-900 placeholder:text-zinc-400 focus:border-[#00E6B4] focus:ring-[#00E6B4] text-white group-hover:border-[#00E6B4]/50 transition-colors"
          placeholder="Press ⌘K to open commands..."
          readOnly
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-zinc-500">
          <Command className="w-4 h-4 group-hover:text-[#00E6B4] transition-colors" />
          <span className="text-xs">K</span>
        </div>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search for commands..." />
        <CommandList>
          <CommandEmpty>
            <div className="flex flex-col items-center justify-center py-14 gap-2">
              <Search className="w-12 h-12 text-zinc-500" />
              <p className="text-zinc-500">No results found.</p>
            </div>
          </CommandEmpty>
          <CommandGroup heading="Quick Actions">
            <CommandItem
              onSelect={() => runCommand(() => router.push('/attendance'))}
              className="group"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="bg-[#00E6B4]/10 p-1.5 rounded-lg">
                  <Users className="h-5 w-5 text-[#00E6B4]" />
                </div>
                <div className="flex flex-col">
                  <span>Check Attendance</span>
                  <span className="text-xs text-zinc-400">View and manage guild attendance</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CommandShortcut>⌘A</CommandShortcut>
                <ArrowRight className="w-4 h-4 text-zinc-400 group-aria-selected:text-[#00E6B4]" />
              </div>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push('/regear-calculator'))}
              className="group"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="bg-[#00E6B4]/10 p-1.5 rounded-lg">
                  <Calculator className="h-5 w-5 text-[#00E6B4]" />
                </div>
                <div className="flex flex-col">
                  <span>Regear Calculator</span>
                  <span className="text-xs text-zinc-400">Calculate regear costs</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CommandShortcut>⌘R</CommandShortcut>
                <ArrowRight className="w-4 h-4 text-zinc-400 group-aria-selected:text-[#00E6B4]" />
              </div>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push('/profile'))}
              className="group"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="bg-[#00E6B4]/10 p-1.5 rounded-lg">
                  <User className="h-5 w-5 text-[#00E6B4]" />
                </div>
                <div className="flex flex-col">
                  <span>Player Profile</span>
                  <span className="text-xs text-zinc-400">View and manage your player profile</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CommandShortcut>⌘P</CommandShortcut>
                <ArrowRight className="w-4 h-4 text-zinc-400 group-aria-selected:text-[#00E6B4]" />
              </div>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          
          <CommandGroup heading="Help">
            <CommandItem
              onSelect={() => runCommand(() => router.push('/docs'))}
              className="group"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="bg-[#00E6B4]/10 p-1.5 rounded-lg">
                  <BookOpen className="h-5 w-5 text-[#00E6B4]" />
                </div>
                <div className="flex flex-col">
                  <span>Documentation</span>
                  <span className="text-xs text-zinc-400">Learn how to use groovekeeper</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CommandShortcut>⌘/</CommandShortcut>
                <ArrowRight className="w-4 h-4 text-zinc-400 group-aria-selected:text-[#00E6B4]" />
              </div>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <div className="px-3 py-2 text-xs text-zinc-400 flex items-center justify-center gap-2">
            <span>Navigate with</span>
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-zinc-800/50 rounded text-zinc-500">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-zinc-800/50 rounded text-zinc-500">↓</kbd>
            </div>
            <span>arrows</span>
          </div>
        </CommandList>
      </CommandDialog>
    </>
  )
} 