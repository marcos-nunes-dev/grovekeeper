'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import PageHero from '@/components/page-hero'
import PlayerProfile from '@/components/player-profile'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const ALBION_REGIONS = [
  { id: 'americas', name: 'Americas' },
  { id: 'europe', name: 'Europe' },
  { id: 'asia', name: 'Asia' },
  { id: 'oceania', name: 'Oceania' },
] as const

export default function Profile() {
  const [playerName, setPlayerName] = useState('')
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null)
  const [region, setRegion] = useState('americas')

  const handleSearch = () => {
    // In a real application, you would fetch the player data here
    setSelectedPlayer(playerName)
  }

  return (
    <div>
      <PageHero 
        title="Player Profile"
        subtitle="View detailed statistics and information about Albion Online players"
        stats={[
          { value: '1M+', label: 'Players Tracked' },
          { value: '100B+', label: 'Total Fame' }
        ]}
      >
        <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-zinc-800 p-6 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-zinc-400" />
              <div className="flex-1 flex items-center gap-2">
                <Select value={region} onValueChange={setRegion}>
                  <SelectTrigger className="w-[140px] bg-transparent border-0 focus:ring-0 focus:ring-offset-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ALBION_REGIONS.map((region) => (
                      <SelectItem key={region.id} value={region.id}>
                        {region.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="w-px h-6 bg-zinc-800" />
                <Input
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter player name"
                  className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
                />
              </div>
            </div>
            <div className="h-px bg-zinc-800" />
          </div>

          <Button 
            onClick={handleSearch} 
            className="w-full bg-[#00E6B4] text-black hover:bg-[#1BECA0]"
            disabled={!playerName}
          >
            View Profile
          </Button>
        </div>
      </PageHero>

      <div className="container mx-auto px-4">
        {selectedPlayer && (
          <PlayerProfile playerName={selectedPlayer} region={region} />
        )}
      </div>
    </div>
  )
}

