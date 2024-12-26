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

const roleFilters = [
  { icon: Sword, label: 'DPS' },
  { icon: Shield, label: 'Tank' },
  { icon: Cross, label: 'Healer' },
  { icon: Zap, label: 'Support' },
  { icon: Headphones, label: 'Utility' },
]

const weaponTypes = [
  'All weapons',
  'Arcane Staff',
  'Axe',
  'Bow',
  'Crossbow',
  'Cursed Staff',
  'Dagger',
  'Fire Staff',
  'Frost Staff',
  'Hammer',
  'Holy Staff',
  'Mace',
  'Nature Staff',
  'Quarterstaff',
  'Spear',
  'Sword',
]

export default function BuildFilters() {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [selectedWeapon, setSelectedWeapon] = useState<string>('All weapons')

  const toggleRole = (label: string) => {
    setSelectedRoles(prev => 
      prev.includes(label)
        ? prev.filter(c => c !== label)
        : [...prev, label]
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2 bg-[#161B22] p-[1px] rounded-lg border border-zinc-800">
        {roleFilters.map(({ icon: Icon, label }) => (
          <Button
            key={label}
            variant="ghost"
            size="icon"
            className={`w-10 h-10 rounded-md ${
              selectedRoles.includes(label)
                ? 'bg-[#00E6B4] text-black hover:bg-[#1BECA0] hover:text-black'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
            onClick={() => toggleRole(label)}
          >
            <Icon className="h-5 w-5" />
          </Button>
        ))}
      </div>

      <Select value={selectedWeapon} onValueChange={setSelectedWeapon}>
        <SelectTrigger className="w-[180px] h-[42px] bg-[#161B22] border-zinc-800">
          <SelectValue placeholder="Filter by weapon" />
        </SelectTrigger>
        <SelectContent>
          {weaponTypes.map((weapon) => (
            <SelectItem key={weapon} value={weapon}>
              {weapon}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
