'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sword, Shield, Cross, Zap, Headphones } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CONTENT_TYPES } from '@/lib/constants'

const classFilters = [
  { icon: Sword, label: 'DPS' },
  { icon: Shield, label: 'Tank' },
  { icon: Cross, label: 'Healer' },
  { icon: Zap, label: 'Support' },
  { icon: Headphones, label: 'Utility' },
]

export default function CompositionFilters() {
  const [selectedClasses, setSelectedClasses] = useState<string[]>([])
  const [selectedContentType, setSelectedContentType] = useState<string>('all')

  const toggleClass = (label: string) => {
    setSelectedClasses(prev => 
      prev.includes(label)
        ? prev.filter(c => c !== label)
        : [...prev, label]
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-4 mb-6">
      <div className="flex items-center gap-2 bg-[#161B22] p-[1px] rounded-lg border border-zinc-800">
        {classFilters.map(({ icon: Icon, label }) => (
          <Button
            key={label}
            variant="ghost"
            size="icon"
            className={`w-10 h-10 rounded-md ${
              selectedClasses.includes(label)
                ? 'bg-[#00E6B4] text-black hover:bg-[#1BECA0] hover:text-black'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
            onClick={() => toggleClass(label)}
          >
            <Icon className="h-5 w-5" />
          </Button>
        ))}
      </div>

      <Select value={selectedContentType} onValueChange={setSelectedContentType}>
        <SelectTrigger className="w-[180px] h-[42px] bg-[#161B22] border-zinc-800">
          <SelectValue placeholder="Filter by content type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All content types</SelectItem>
          {CONTENT_TYPES.map((type) => (
            <SelectItem key={type} value={type}>
              {type}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

