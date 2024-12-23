import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Share2, Sword, Users, Coins, Check, Loader2, AlertCircle } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import GuildHistory from './guild-history'

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

interface PlayerProfileProps {
  playerData: PlayerData
  region: string
  shareUrl: string
  cacheStatus: CacheStatus
}

interface MurderLedgerEvent {
  id: number
  time: number
  battle_id: number
  killer: {
    name: string
    item_power: number
    guild_name: string | null
    alliance_name: string | null
    loadout: {
      main_hand?: {
        id: string
        type: string
        tier: number
        enchant: number
        quality: number
        en_name: string
      }
      off_hand?: {
        id: string
        type: string
        tier: number
        enchant: number
        quality: number
        en_name: string
      }
      head?: {
        id: string
        type: string
        tier: number
        enchant: number
        quality: number
        en_name: string
      }
      body?: {
        id: string
        type: string
        tier: number
        enchant: number
        quality: number
        en_name: string
      }
      shoe?: {
        id: string
        type: string
        tier: number
        enchant: number
        quality: number
        en_name: string
      }
      bag?: {
        id: string
        type: string
        tier: number
        enchant: number
        quality: number
        en_name: string
      }
      cape?: {
        id: string
        type: string
        tier: number
        enchant: number
        quality: number
        en_name: string
      }
      mount?: {
        id: string
        type: string
        tier: number
        enchant: number
        quality: number
        en_name: string
      }
      food?: {
        id: string
        type: string
        tier: number
        enchant: number
        quality: number
        en_name: string
      }
      potion?: {
        id: string
        type: string
        tier: number
        enchant: number
        quality: number
        en_name: string
      }
    }
    vod: string
    is_primary: boolean
    kill_fame: number
    damage_done: number
    healing_done: number
  }
  victim: {
    name: string
    item_power: number
    guild_name: string | null
    alliance_name: string | null
    loadout: {
      main_hand?: {
        id: string
        type: string
        tier: number
        enchant: number
        quality: number
        en_name: string
      }
      off_hand?: {
        id: string
        type: string
        tier: number
        enchant: number
        quality: number
        en_name: string
      }
      head?: {
        id: string
        type: string
        tier: number
        enchant: number
        quality: number
        en_name: string
      }
      body?: {
        id: string
        type: string
        tier: number
        enchant: number
        quality: number
        en_name: string
      }
      shoe?: {
        id: string
        type: string
        tier: number
        enchant: number
        quality: number
        en_name: string
      }
      bag?: {
        id: string
        type: string
        tier: number
        enchant: number
        quality: number
        en_name: string
      }
      cape?: {
        id: string
        type: string
        tier: number
        enchant: number
        quality: number
        en_name: string
      }
      mount?: {
        id: string
        type: string
        tier: number
        enchant: number
        quality: number
        en_name: string
      }
      food?: {
        id: string
        type: string
        tier: number
        enchant: number
        quality: number
        en_name: string
      }
      potion?: {
        id: string
        type: string
        tier: number
        enchant: number
        quality: number
        en_name: string
      }
    }
    vod: string
  }
  total_kill_fame: number
  participant_count: number
  party_size: number
  tags: {
    is_1v1: boolean
    is_2v2: boolean
    is_5v5: boolean
    is_zvz: boolean
    fair: boolean
    unfair: boolean
  }
}

// Mock data that we'll replace with real data in the future
const fameData = [
  { date: '12/13', fame: 20000 },
  { date: '12/14', fame: 22000 },
  { date: '12/15', fame: 21000 },
  { date: '12/16', fame: 25000 },
  { date: '12/17', fame: 28000 },
  { date: '12/18', fame: 27000 },
  { date: '12/19', fame: 32000 },
]

const zvzData = [
  { date: '12/15', wins: 2, losses: 1 },
  { date: '12/16', wins: 3, losses: 2 },
  { date: '12/17', wins: 4, losses: 0 },
  { date: '12/18', wins: 1, losses: 2 },
  { date: '12/19', wins: 5, losses: 1 },
  { date: '12/20', wins: 3, losses: 1 },
  { date: '12/21', wins: 2, losses: 2 },
]

const recentActivities = [
  {
    type: 'ZvZ',
    result: 'Victory',
    time: '2 hours ago',
    kills: 5,
    deaths: 1,
    assists: 12,
    fame: 150000,
    equipment: {
      mainHand: 'T8_MAIN_SPEAR',
      offHand: 'T8_OFF_SHIELD',
      head: 'T8_HEAD_PLATE',
      chest: 'T8_ARMOR_PLATE',
      shoes: 'T8_SHOES_PLATE',
      cape: 'T8_CAPE',
    },
    allies: ['Player1', 'Player2', 'Player3'],
    enemies: ['Enemy1', 'Enemy2', 'Enemy3'],
  },
  // ... (keep other mock activities)
]

function formatFame(fame: number | undefined | null): string {
  if (fame === undefined || fame === null) return '0'
  
  if (fame >= 1_000_000_000) {
    return `${(fame / 1_000_000_000).toFixed(1)}B`
  }
  if (fame >= 1_000_000) {
    return `${(fame / 1_000_000).toFixed(1)}M`
  }
  if (fame >= 1_000) {
    return `${(fame / 1_000).toFixed(1)}K`
  }
  return fame.toString()
}

// Add isCheckingNewEvents to the response type
interface EventsResponse {
  data: MurderLedgerEvent[];
  newEventsCount: number;
  totalEvents: number;
  isCheckingNewEvents: boolean;
}

// Add a skeleton loader component for events
function EventSkeleton() {
  return (
    <Card className="bg-[#0D1117] border-zinc-800/50 p-3 rounded-lg animate-pulse">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-16 h-4 bg-zinc-800 rounded" />
            <div className="w-12 h-4 bg-zinc-800 rounded" />
            <div className="w-24 h-4 bg-zinc-800 rounded" />
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-8 bg-zinc-800 rounded" />
            <div className="w-32 h-4 bg-zinc-800 rounded" />
            <div className="w-24 h-4 bg-zinc-800 rounded" />
          </div>
          <div className="flex gap-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="w-10 h-10 bg-zinc-800 rounded" />
            ))}
          </div>
        </div>
        <div className="flex gap-8">
          <div className="space-y-1">
            <div className="w-24 h-4 bg-zinc-800 rounded" />
            <div className="w-20 h-3 bg-zinc-800 rounded" />
          </div>
          <div className="space-y-1">
            <div className="w-24 h-4 bg-zinc-800 rounded" />
            <div className="w-20 h-3 bg-zinc-800 rounded" />
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function PlayerProfile({ 
  playerData = { 
    id: '', 
    name: '', 
    guildName: '', 
    allianceName: '', 
    allianceTag: '', 
    avatar: '',
    killFame: 0,
    deathFame: 0,
    pveTotal: 0,
    gatheringTotal: 0,
    craftingTotal: 0,
    region: ''
  }, 
  region = '', 
  shareUrl = '', 
  cacheStatus = { isStale: false, isUpdating: false }
}: PlayerProfileProps) {
  const [copied, setCopied] = useState(false)
  const [recentEvents, setRecentEvents] = useState<MurderLedgerEvent[]>([])
  const [isLoadingInitial, setIsLoadingInitial] = useState(true)
  const [isCheckingNewEvents, setIsCheckingNewEvents] = useState(false)
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`/api/player/${playerData.name}/events?limit=10`)
        const data = await response.json() as EventsResponse
        
        if ('data' in data) {
          setRecentEvents(data.data)
          setIsCheckingNewEvents(data.isCheckingNewEvents)

          // Set up SSE connection for updates
          if (data.isCheckingNewEvents) {
            const eventSource = new EventSource(`/api/player/${playerData.name}/updates?region=${region}`)
            eventSourceRef.current = eventSource

            eventSource.onmessage = (event) => {
              const update = JSON.parse(event.data)
              setRecentEvents(update.data)
              setIsCheckingNewEvents(update.isCheckingNewEvents)

              // If we're done checking or there's an error, close the connection
              if (!update.isCheckingNewEvents || update.error) {
                eventSource.close()
                eventSourceRef.current = null
              }
            }

            eventSource.onerror = () => {
              setIsCheckingNewEvents(false)
              eventSource.close()
              eventSourceRef.current = null
            }
          }
        }
      } catch (error) {
        console.error('Error fetching events:', error)
        setIsCheckingNewEvents(false)
      } finally {
        setIsLoadingInitial(false)
      }
    }

    if (playerData.name) {
      fetchEvents()
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
    }
  }, [playerData.name, region])

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp * 1000) / 1000)
    
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy URL:', err)
    }
  }

  // Calculate ZvZ stats
  const zvzStats = {
    total: zvzData.reduce((sum, day) => sum + day.wins + day.losses, 0),
    wins: zvzData.reduce((sum, day) => sum + day.wins, 0),
    losses: zvzData.reduce((sum, day) => sum + day.losses, 0),
  }

  // Calculate ganking stats
  const gankingStats = {
    kills: 45,
    deaths: 12,
    silverEarned: 25000000,
    silverLost: 8000000,
  }

  // Calculate fame percentages for progress bars
  const totalFame = playerData.killFame + playerData.pveTotal + playerData.gatheringTotal
  const pvpPercentage = (playerData.killFame / totalFame) * 100
  const pvePercentage = (playerData.pveTotal / totalFame) * 100
  const gatheringPercentage = (playerData.gatheringTotal / totalFame) * 100

  return (
    <div className="grid grid-cols-12 gap-4">
      {/* Left Sidebar */}
      <div className="col-span-3 space-y-4">
        {/* Player Info Card */}
        <Card className="bg-[#0D1117] border-zinc-800/50 p-4 rounded-lg">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3 -translate-x-4">
              <div className="relative w-24 h-24">
                <Image
                  src="/avatar2.png"
                  alt={playerData.name}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover rounded-full"
                />
                <Image
                  src="/border.png"
                  alt="border"
                  width={64}
                  height={64}
                  className="absolute top-0 left-0 w-full h-full object-contain"
                />
              </div>
              <div className="flex items-start gap-2">
                <div className="flex flex-col">
                  <h2 className="text-xl font-bold">{playerData.name}</h2>
                  <p className="text-sm text-zinc-400">{region}</p>
                </div>
                {cacheStatus?.isUpdating ? (
                  <Loader2 className="h-4 w-4 mt-2 animate-spin text-[#00E6B4]" />
                ) : cacheStatus?.isStale && (
                  <TooltipProvider>
                    <UITooltip>
                      <TooltipTrigger>
                        <AlertCircle className="h-4 w-4 mt-2 text-yellow-500" />
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>Albion API is unstable, this data may be stale</p>
                      </TooltipContent>
                    </UITooltip>
                  </TooltipProvider>
                )}                
              </div>
            </div>
            <div className="relative">
              <TooltipProvider>
                {copied ? (
                  <UITooltip open>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={handleShare}>
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="bg-[#00E6B4] border-0">
                      <div className="flex items-center gap-2 text-black">
                        <Check className="h-4 w-4" />
                        <span>Copied to clipboard!</span>
                      </div>
                    </TooltipContent>
                  </UITooltip>
                ) : (
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={handleShare}>
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <div className="flex items-center gap-2">
                        <Share2 className="h-4 w-4" />
                        <span>Share profile</span>
                      </div>
                    </TooltipContent>
                  </UITooltip>
                )}
              </TooltipProvider>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-zinc-400">Guild</span>
                <span>{playerData.guildName || 'No Guild'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Alliance</span>
                <span>{playerData.allianceName || 'No Alliance'}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>PvP Fame</span>
                  <span className="text-[#00E6B4]">{formatFame(playerData.killFame)}</span>
                </div>
                <Progress value={pvpPercentage} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>PvE Fame</span>
                  <span className="text-[#00E6B4]">{formatFame(playerData.pveTotal)}</span>
                </div>
                <Progress value={pvePercentage} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Gathering Fame</span>
                  <span className="text-[#00E6B4]">{formatFame(playerData.gatheringTotal)}</span>
                </div>
                <Progress value={gatheringPercentage} className="h-2" />
              </div>
            </div>
          </div>
        </Card>

        {/* Keep the rest of the components unchanged for now */}
        {/* Fame Progression Graph */}
        <Card className="bg-[#0D1117] border-zinc-800/50 p-4 rounded-lg">
          <h3 className="font-semibold mb-4">Fame Progression</h3>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={fameData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <CartesianGrid stroke="#27272a" strokeDasharray="4" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#71717a" 
                  axisLine={false} 
                  tickLine={false}
                  fontSize={12}
                />
                <YAxis 
                  stroke="#71717a" 
                  axisLine={false} 
                  tickLine={false} 
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1C2128',
                    border: '1px solid rgba(39, 39, 42, 0.5)',
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="fame" 
                  stroke="#00E6B4" 
                  dot={false}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Guild History Widget */}
        <GuildHistory 
          playerName={playerData.name} 
          region={region} 
          currentGuild={playerData.guildName}
        />
      </div>

      {/* Main Content */}
      <div className="col-span-9 space-y-3">
        <h3 className="font-semibold text-lg px-1">Recent Activities</h3>
        
        {isLoadingInitial ? (
          // Initial loading state when we have no data
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <EventSkeleton key={i} />
            ))}
          </div>
        ) : recentEvents.length === 0 ? (
          // Empty state
          <Card className="bg-[#0D1117] border-zinc-800/50 p-6 rounded-lg">
            <div className="text-center text-zinc-400">
              No recent activities found
            </div>
          </Card>
        ) : (
          // Events list with potential loading state for new events
          <div className="space-y-3">
            {isCheckingNewEvents && <EventSkeleton />}
            {recentEvents.map((event: MurderLedgerEvent) => {
              const isKiller = event.killer.name.toLowerCase() === (playerData?.name || '').toLowerCase();
              const loadout = isKiller ? event.killer.loadout : event.victim.loadout;
              
              return (
                <Card 
                  key={event.id} 
                  className={`bg-[#0D1117] border-zinc-800/50 p-3 rounded-lg ${
                    isKiller ? 'border-green-500/20' : 'border-red-500/20'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Activity Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-sm font-medium ${isKiller ? 'text-green-500' : 'text-red-500'}`}>
                          {isKiller ? 'Kill' : 'Death'}
                        </span>
                        <span className="text-sm text-zinc-400">
                          {event.tags.is_1v1 ? '1v1' : 
                           event.tags.is_2v2 ? '2v2' : 
                           event.tags.is_5v5 ? '5v5' : 
                           event.tags.is_zvz ? 'ZvZ' : 'PvP'}
                        </span>
                        <span className="text-sm text-zinc-400">{formatTimeAgo(event.time)}</span>
                      </div>
                      
                      <div className="flex items-center gap-4 mb-4">
                        <div className="text-2xl font-bold">
                          {isKiller ? '1/0/0' : '0/1/0'}
                        </div>
                        <div className="text-sm text-zinc-400">
                          {formatFame(event.total_kill_fame)} Fame
                        </div>
                        <div className="text-sm text-zinc-400">
                          IP: {isKiller ? event.killer.item_power : event.victim.item_power}
                        </div>
                        {event.participant_count > 2 && (
                          <div className="text-sm text-zinc-400">
                            {event.participant_count} Players
                          </div>
                        )}
                      </div>

                      {/* Equipment */}
                      <div className="flex gap-2">
                        {Object.entries(loadout).map(([slot, item]) => {
                          if (!item || ['food', 'potion'].includes(slot)) return null;
                          return (
                            <div key={slot} className="w-10 h-10 bg-zinc-900 rounded border border-zinc-800">
                              <Image
                                src={`https://render.albiononline.com/v1/item/${item.id}.png`}
                                alt={item.en_name}
                                width={40}
                                height={40}
                                className="w-full h-full object-contain"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Players */}
                    <div className="flex gap-8">
                      <div className="space-y-1">
                        <div className="text-sm text-zinc-400">{event.killer.name}</div>
                        <div className="text-xs text-zinc-500">{event.killer.guild_name || 'No Guild'}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm text-zinc-400">{event.victim.name}</div>
                        <div className="text-xs text-zinc-500">{event.victim.guild_name || 'No Guild'}</div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Performance Stats */}
      <div className="col-span-12 grid grid-cols-2 gap-4">
        {/* ZvZ Performance */}
        <Card className="bg-[#0D1117] border-zinc-800/50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-5 w-5 text-[#00E6B4]" />
            <h3 className="font-semibold">ZvZ Performance (Last 7 Days)</h3>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{zvzStats.total}</div>
              <div className="text-sm text-zinc-400">Total Battles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{zvzStats.wins}</div>
              <div className="text-sm text-zinc-400">Victories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{zvzStats.losses}</div>
              <div className="text-sm text-zinc-400">Defeats</div>
            </div>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={zvzData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <CartesianGrid stroke="#27272a" strokeDasharray="4" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#71717a" 
                  axisLine={false} 
                  tickLine={false}
                  fontSize={12}
                />
                <YAxis 
                  stroke="#71717a" 
                  axisLine={false} 
                  tickLine={false}
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1C2128',
                    border: '1px solid rgba(39, 39, 42, 0.5)',
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                />
                <Bar 
                  dataKey="wins" 
                  stackId="battles"
                  fill="#00E6B4"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                  name="Victories"
                />
                <Bar 
                  dataKey="losses" 
                  stackId="battles"
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                  name="Defeats"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Ganking Performance */}
        <Card className="bg-[#0D1117] border-zinc-800/50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Sword className="h-5 w-5 text-[#00E6B4]" />
            <h3 className="font-semibold">Ganking Performance</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-zinc-400">K/D Ratio</span>
                <span className="text-lg font-bold">{(gankingStats.kills / gankingStats.deaths).toFixed(2)}</span>
              </div>
              <div className="flex gap-2 text-sm">
                <span className="text-green-500">{gankingStats.kills} kills</span>
                <span className="text-zinc-400">/</span>
                <span className="text-red-500">{gankingStats.deaths} deaths</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Coins className="h-4 w-4 text-[#00E6B4]" />
                <span className="text-sm text-zinc-400">Silver Balance</span>
              </div>
              <div className="space-y-1">
                <div className="text-sm">
                  <span className="text-green-500">+{gankingStats.silverEarned.toLocaleString()}</span>
                </div>
                <div className="text-sm">
                  <span className="text-red-500">-{gankingStats.silverLost.toLocaleString()}</span>
                </div>
                <div className="text-sm font-bold">
                  = {(gankingStats.silverEarned - gankingStats.silverLost).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={fameData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <CartesianGrid stroke="#27272a" strokeDasharray="4" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#71717a" 
                  axisLine={false} 
                  tickLine={false}
                  fontSize={12}
                />
                <YAxis 
                  stroke="#71717a" 
                  axisLine={false} 
                  tickLine={false}
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1C2128',
                    border: '1px solid rgba(39, 39, 42, 0.5)',
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="fame" 
                  stroke="#00E6B4" 
                  dot={false}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  )
}

