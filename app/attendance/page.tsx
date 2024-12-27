'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { HelpCircle, Search } from 'lucide-react'
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
import { Switch } from "@/components/ui/switch"
import AttendanceResult, { type AttendanceResult as AttendanceResultType } from '@/components/attendance-result'
import GuildInfo from '@/components/guild-info'
import PageHero from '@/components/page-hero'
import { useDebounce } from '@/lib/hooks/use-debounce'

type BattleType = 'zvz' | 'all'

interface GuildSearchResult {
  Id: string
  Name: string
  AllianceId: string
  AllianceName: string
  KillFame: number
  DeathFame: number
}

interface GuildStats {
  memberCount: number
  totalKillFame: number
  totalDeathFame: number
  totalPvEFame: number
  totalGatheringFame: number
  totalCraftingFame: number
  averageKillFame: number
  averageDeathFame: number
  averagePvEFame: number
}

interface GuildSuccess {
  type: 'success'
  Name: string
  AllianceName: string | null
  statistics: GuildStats
}

interface GuildError {
  type: 'error'
  error: string
}

type GuildInfo = GuildSuccess | GuildError

export default function Attendance() {
  const [guildName, setGuildName] = useState('')
  const [battleType, setBattleType] = useState<BattleType>('zvz')
  const [useCustomList, setUseCustomList] = useState(false)
  const [playerNames, setPlayerNames] = useState('')
  const [result, setResult] = useState<AttendanceResultType | null>(null)
  const [guildInfo, setGuildInfo] = useState<GuildInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [guildMembers, setGuildMembers] = useState<string[]>([])
  const debouncedGuildName = useDebounce(guildName, 500)

  // Search for guild when name changes
  const searchGuild = async (name: string) => {
    if (!name) return

    try {
      setIsSearching(true)
      const response = await fetch(`/api/guilds/search?q=${encodeURIComponent(name)}`)
      if (!response.ok) return

      const guilds: GuildSearchResult[] = await response.json()
      const exactMatch = guilds.find(g => g.Name.toLowerCase() === name.toLowerCase())
      
      if (exactMatch) {
        const detailsResponse = await fetch(`/api/guilds/${exactMatch.Id}/members`)
        if (detailsResponse.ok) {
          const details = await detailsResponse.json()
          setGuildInfo({
            type: 'success',
            Name: exactMatch.Name,
            AllianceName: exactMatch.AllianceName,
            statistics: details.statistics
          })
          setGuildMembers(details.members.map((m: { Name: string }) => m.Name))
        }
      } else {
        setGuildInfo(null)
        setGuildMembers([])
        // If there are multiple guilds but no exact match, show a message
        if (guilds.length > 0) {
          setGuildInfo({
            type: 'error',
            error: 'Multiple guilds found with similar names. Please use exact guild name.'
          })
        }
      }
    } catch (error) {
      console.error('Error searching guild:', error)
    } finally {
      setIsSearching(false)
    }
  }

  // Effect to search guild when name changes
  useEffect(() => {
    if (debouncedGuildName) {
      searchGuild(debouncedGuildName)
    } else {
      setGuildInfo(null)
      setGuildMembers([])
    }
  }, [debouncedGuildName])

  const handleCalculate = async () => {
    if (!guildName) return;
    if (useCustomList && !playerNames.trim()) return;

    // Get player list from either custom input or guild members
    const playerList = useCustomList
      ? playerNames
          .split('\n')
          .map(line => {
            const match = line.match(/"([^"]+)"/);
            return match ? match[1] : null;
          })
          .filter(Boolean) as string[]
      : guildMembers;

    try {
      setIsLoading(true)
      
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guildName,
          playerList,
          minGP: battleType === 'zvz' ? 20 : 10,
          // Pass guild info we already have to avoid refetching
          guildInfo: guildInfo && guildInfo.type === 'success' ? {
            killFame: guildInfo.statistics.totalKillFame,
            deathFame: guildInfo.statistics.totalDeathFame,
            memberCount: guildInfo.statistics.memberCount
          } : null
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch attendance data')
      }

      const data = await response.json()
      setResult({ players: data.players })
    } catch (error) {
      console.error('Error calculating attendance:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <PageHero 
        title="Guild Attendance Tracker"
        subtitle="Track and analyze your guild members' participation and performance"
        stats={[
          { value: '1,000+', label: 'Guilds Tracked' },
          { value: '50K+', label: 'Players Analyzed' }
        ]}
      >
        <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-zinc-800 p-6 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <Select
                value={battleType}
                onValueChange={(value: BattleType) => setBattleType(value)}
              >
                <SelectTrigger className="w-[180px] border-0 bg-transparent">
                  <SelectValue placeholder="Battle Type" />
                </SelectTrigger>
                <SelectContent className="bg-[#161B22] border-zinc-800">
                  <SelectItem value="zvz">Only ZvZ</SelectItem>
                  <SelectItem value="all">ZvZ and Small</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2 flex-1">
                <Search className="w-5 h-5 text-zinc-400" />
                <Input
                  value={guildName}
                  onChange={(e) => setGuildName(e.target.value)}
                  placeholder="Enter guild name"
                  className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
                />
              </div>
            </div>
            <div className="h-px bg-zinc-800" />
            {guildInfo?.type === 'error' && (
              <div className="text-sm text-yellow-500 mt-2">
                {guildInfo.error}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch
                checked={useCustomList}
                onCheckedChange={setUseCustomList}
              />
              <Label className="text-sm text-zinc-400">Use custom member list</Label>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-zinc-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>The list of player names can be found in the copy and paste function at the guild management option inside the game.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {useCustomList && (
            <div className="space-y-2">
              <Textarea
                value={playerNames}
                onChange={(e) => setPlayerNames(e.target.value)}
                placeholder="Enter player names (one per line)"
                className="min-h-[100px] bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
              />
              <div className="h-px bg-zinc-800" />
            </div>
          )}

          <Button 
            onClick={handleCalculate} 
            className="w-full bg-[#00E6B4] text-black hover:bg-[#1BECA0] disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={
              isLoading || 
              isSearching || 
              !guildInfo || 
              !guildMembers.length || 
              (useCustomList && !playerNames.trim())
            }
          >
            {isLoading ? 'Calculating...' : isSearching ? 'Searching Guild...' : 'Calculate Attendance'}
          </Button>
        </div>
      </PageHero>

      <div className="container mx-auto px-4">
        <GuildInfo info={guildInfo} isLoading={isSearching} />
        {result && <AttendanceResult result={result} />}
      </div>
    </div>
  )
}

