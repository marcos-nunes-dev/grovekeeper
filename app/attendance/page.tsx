'use client'

import { useState } from 'react'
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
import AttendanceResult, { type AttendanceResult as AttendanceResultType } from '@/components/attendance-result'
import PageHero from '@/components/page-hero'

type BattleType = 'zvz' | 'all'

export default function Attendance() {
  const [guildName, setGuildName] = useState('')
  const [battleType, setBattleType] = useState<BattleType>('zvz')
  const [playerNames, setPlayerNames] = useState('')
  const [result, setResult] = useState<AttendanceResultType | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleCalculate = async () => {
    if (!guildName || !playerNames) return;

    // Parse player names from the textarea
    const playerList = playerNames
      .split('\n')
      .map(line => {
        const match = line.match(/"([^"]+)"/);
        return match ? match[1] : null;
      })
      .filter(Boolean) as string[];

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
          minGP: battleType === 'zvz' ? 20 : 10
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
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="player-names" className="text-sm text-zinc-400">Player Names</Label>
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
            <Textarea
              id="player-names"
              value={playerNames}
              onChange={(e) => setPlayerNames(e.target.value)}
              placeholder="Enter player names (one per line)"
              className="min-h-[100px] bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
            />
            <div className="h-px bg-zinc-800" />
          </div>

          <Button 
            onClick={handleCalculate} 
            className="w-full bg-[#00E6B4] text-black hover:bg-[#1BECA0]"
            disabled={isLoading}
          >
            {isLoading ? 'Calculating...' : 'Calculate Attendance'}
          </Button>
        </div>
      </PageHero>

      <div className="container mx-auto px-4">
        {result && <AttendanceResult result={result} />}
      </div>
    </div>
  )
}

