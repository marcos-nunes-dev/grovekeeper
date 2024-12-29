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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useEventSource } from '@/lib/hooks/useEventSource'
import { MurderLedgerEvent } from '@/types/albion'
import { useProfileStats } from '@/lib/hooks/useProfileStats'
import { AnimatedCounter } from '@/components/ui/animated-counter'
import type { ApiResponse } from '@/lib/types/api'
import { isErrorResponse } from '@/lib/types/api'
import { useApiHealth } from '@/lib/hooks/useApiHealth'

interface EventsResponse {
  data: MurderLedgerEvent[];
  isCheckingNewEvents: boolean;
}

declare global {
  interface Window {
    activeEventSource: EventSource | null;
  }
}

const ALBION_REGIONS = [
  { id: 'west', name: 'West', server: 'https://west.albion-online-data.com' },
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

interface CacheStatus {
  isStale: boolean
  isUpdating: boolean
}

interface PlayerWithEvents extends PlayerData {
  events?: MurderLedgerEvent[]
}

export default function ProfileContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [playerName, setPlayerName] = useState('')
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerWithEvents | null>(null)
  const [cacheStatus, setCacheStatus] = useState<CacheStatus>({ isStale: false, isUpdating: true })
  const [region, setRegion] = useState('west')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCheckingNewEvents, setIsCheckingNewEvents] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const { isHealthy, isLoading: isHealthLoading } = useApiHealth()

  // Add profile stats
  const { data: stats } = useProfileStats()

  // Use our custom hook for EventSource
  useEventSource(
    selectedPlayer ? `/api/player/${encodeURIComponent(selectedPlayer.name)}/updates` : null,
    (update) => {
      const response = JSON.parse(update.data) as ApiResponse;
      if (!isErrorResponse(response)) {
        setSelectedPlayer(prev => prev ? {
          ...prev,
          ...response.data
        } : null);
        setCacheStatus(response.cacheStatus);
        setIsCheckingNewEvents(Boolean(response.isCheckingNewEvents));
      }
    }
  );

  // Separate event source for events updates
  useEventSource(
    selectedPlayer ? `/api/player/${encodeURIComponent(selectedPlayer.name)}/events/updates` : null,
    (update) => {
      const response = JSON.parse(update.data) as EventsResponse;
      setSelectedPlayer(prev => prev ? {
        ...prev,
        events: response.data
      } : null);
      setIsCheckingNewEvents(Boolean(response.isCheckingNewEvents));
    }
  );

  useEffect(() => {
    if (!searchParams) return;
    
    const nameParam = searchParams.get('name')
    const regionParam = searchParams.get('region')

    if (nameParam) {
      setPlayerName(nameParam)
      if (regionParam && ALBION_REGIONS.some(r => r.id === regionParam)) {
        setRegion(regionParam)
      }
      handleSearch(nameParam, regionParam || region)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  // Add event listener for loading more events
  useEffect(() => {
    const handleLoadMore = (event: CustomEvent<{ newEvents: MurderLedgerEvent[], playerName: string }>) => {
      const { newEvents, playerName: eventPlayerName } = event.detail;
      
      // Only update if the events are for the current player
      if (selectedPlayer && eventPlayerName.toLowerCase() === selectedPlayer.name.toLowerCase()) {
        setSelectedPlayer(prev => prev ? {
          ...prev,
          events: [...(prev.events || []), ...newEvents]
        } : null);
      }
    };

    window.addEventListener('loadMoreEvents', handleLoadMore as EventListener);
    return () => window.removeEventListener('loadMoreEvents', handleLoadMore as EventListener);
  }, [selectedPlayer]);

  const handleSearch = async (name = playerName, selectedRegion = region) => {
    if (!name.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      // Make the initial request
      const response = await fetch(`/api/player/${encodeURIComponent(name)}?region=${selectedRegion}`)
      const data = await response.json() as ApiResponse
      
      if (!response.ok || isErrorResponse(data)) {
        const errorMessage = isErrorResponse(data) ? data.error : 'Failed to fetch player data'
        throw new Error(errorMessage)
      }

      // Fetch initial events
      const eventsResponse = await fetch(`/api/player/${encodeURIComponent(name)}/events?limit=10`)
      const eventsData = await eventsResponse.json() as EventsResponse

      // Set both player data and events in a single update
      const newPlayerData = {
        ...data.data,
        events: eventsData.data
      };

      setSelectedPlayer(newPlayerData)
      setCacheStatus(data.cacheStatus)
      setIsCheckingNewEvents(eventsData.isCheckingNewEvents)
      setIsInitialLoad(false)

      // Update URL with search parameters
      router.push(`/profile?name=${encodeURIComponent(name)}&region=${selectedRegion}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setSelectedPlayer(null)
      setCacheStatus({ isStale: false, isUpdating: false })
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
          { 
            value: <AnimatedCounter 
              value={stats?.playersTracked || 0} 
              showZeroAsQuestionMarks={false} 
            />, 
            label: 'Players Tracked' 
          },
          { 
            value: <AnimatedCounter 
              value={stats?.totalPvpFame || 0} 
              showZeroAsQuestionMarks={false} 
            />, 
            label: 'Total PvP Fame' 
          },
          { 
            value: <AnimatedCounter 
              value={stats?.totalPveFame || 0} 
              showZeroAsQuestionMarks={false} 
            />, 
            label: 'Total PvE Fame' 
          }
        ]}
      >
        <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-zinc-800 p-6 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-zinc-400" />
              <div className="flex-1 flex items-center gap-2">
                <Select value={region} onValueChange={handleRegionChange} disabled>
                  <SelectTrigger className="w-[140px] bg-transparent border-0 focus:ring-0 focus:ring-offset-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0D1117]/95 border-zinc-800 backdrop-blur-sm">
                    <SelectItem 
                      value="west"
                      className="text-zinc-300 focus:bg-zinc-800/50 focus:text-zinc-100"
                    >
                      West
                    </SelectItem>
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
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div 
                        className={`w-2 h-2 rounded-full transition-colors ${
                          isHealthLoading ? 'bg-yellow-500' :
                          isHealthy ? 'bg-green-500' : 'bg-red-500'
                        }`}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {isHealthLoading ? 'Checking API status...' :
                         isHealthy ? 'Albion API is operational' : 'Albion API is down'}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
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
        {selectedPlayer && (!isLoading || !isInitialLoad) && (
          <PlayerProfile 
            playerData={selectedPlayer} 
            events={selectedPlayer.events || []}
            isCheckingNewEvents={isCheckingNewEvents}
            shareUrl={`${window.location.origin}/profile?name=${encodeURIComponent(selectedPlayer.name)}&region=${region}`}
            cacheStatus={cacheStatus}
          />
        )}
      </div>
    </div>
  )
} 