'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import PageHero from '@/components/page-hero'
import PlayerProfile from '@/components/player-profile'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const ALBION_REGIONS = [
  { id: 'west', name: 'West', server: 'https://west.albion-online-data.com' },
  { id: 'east', name: 'East', server: 'https://east.albion-online-data.com' },
  { id: 'europe', name: 'Europe', server: 'https://europe.albion-online-data.com' },
] as const

interface PlayerData {
  id: string
  name: string
  guildName: string
  allianceName: string
  allianceTag: string
  avatar: string
  killFame: number
  deathFame: number
  pveTotal: number
  gatheringTotal: number
  craftingTotal: number
  region: string
}

export default function Profile() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [playerName, setPlayerName] = useState('')
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerData | null>(null)
  const [region, setRegion] = useState('west')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const nameParam = searchParams.get('name')
    const regionParam = searchParams.get('region')

    if (nameParam) {
      setPlayerName(nameParam)
      if (regionParam && ALBION_REGIONS.some(r => r.id === regionParam)) {
        setRegion(regionParam)
      }
      handleSearch(nameParam, regionParam || region)
    }
  }, [searchParams])

  const handleSearch = async (name = playerName, selectedRegion = region) => {
    if (!name.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/player/${encodeURIComponent(name)}?region=${selectedRegion}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch player data')
      }

      setSelectedPlayer(data)
      // Update URL with search parameters
      router.push(`/profile?name=${encodeURIComponent(name)}&region=${selectedRegion}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setSelectedPlayer(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegionChange = (newRegion: string) => {
    setRegion(newRegion)
    if (selectedPlayer) {
      handleSearch(playerName, newRegion)
    }
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
                <Select value={region} onValueChange={handleRegionChange}>
                  <SelectTrigger className="w-[140px] bg-transparent border-0 focus:ring-0 focus:ring-offset-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0D1117]/95 border-zinc-800 backdrop-blur-sm">
                    {ALBION_REGIONS.map((region) => (
                      <SelectItem 
                        key={region.id} 
                        value={region.id}
                        className="text-zinc-300 focus:bg-zinc-800/50 focus:text-zinc-100"
                      >
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch()
                    }
                  }}
                />
              </div>
            </div>
            <div className="h-px bg-zinc-800" />
          </div>

          <Button 
            onClick={() => handleSearch()} 
            className="w-full bg-[#00E6B4] text-black hover:bg-[#1BECA0]"
            disabled={!playerName.trim() || isLoading}
          >
            {isLoading ? 'Searching...' : 'View Profile'}
          </Button>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}
        </div>
      </PageHero>

      <div className="container mx-auto px-4">
        {selectedPlayer && (
          <PlayerProfile 
            playerData={selectedPlayer} 
            region={region}
            shareUrl={`${window.location.origin}/profile?name=${encodeURIComponent(playerName)}&region=${region}`}
          />
        )}
      </div>
    </div>
  )
}

