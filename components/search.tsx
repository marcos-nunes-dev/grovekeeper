'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { SearchIcon } from 'lucide-react'

export default function Search() {
  const [search, setSearch] = useState('')

  return (
    <div className="relative w-full">
      <Input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search compositions..."
        className="w-full pl-10 pr-4 py-2 bg-zinc-900/50 border-zinc-800 ring-offset-zinc-900 placeholder:text-zinc-400 focus:border-[#00E6B4] focus:ring-[#00E6B4] text-white"
      />
      <SearchIcon className="absolute w-5 h-5 text-zinc-400 transform -translate-y-1/2 left-3 top-1/2" />
    </div>
  )
}

