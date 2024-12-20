'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { HelpCircle, Search } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import AttendanceResult, { type AttendanceResult as AttendanceResultType } from '@/components/attendance-result'
import PageHero from '@/components/page-hero'

export default function Attendance() {
  const [guildName, setGuildName] = useState('')
  const [playerNames, setPlayerNames] = useState('')
  const [result, setResult] = useState<AttendanceResultType | null>(null)

  const handleCalculate = () => {
    // Mock response with enhanced data
    const mockResult: AttendanceResultType = {
      players: [
        {
          rank: 1,
          name: 'TopPlayer123',
          mainClass: 'DPS',
          tier: 'S',
          totalKills: 250,
          totalDeaths: 50,
          avgIP: 1350,
          totalAttendance: 95,
          attendanceComparison: 25,
          topWeapons: ['T8_MAIN_SPEAR', 'T8_2H_QUARTERSTAFF', 'T8_MAIN_SWORD'],
        },
        {
          rank: 2,
          name: 'HealerPro',
          mainClass: 'Healer',
          tier: 'A',
          totalKills: 50,
          totalDeaths: 30,
          avgIP: 1300,
          totalAttendance: 90,
          attendanceComparison: 15,
          topWeapons: ['T8_2H_HOLYSTAFF', 'T8_2H_DIVINESTAFF'],
        },
        {
          rank: 3,
          name: 'TankMaster',
          mainClass: 'Tank',
          tier: 'A',
          totalKills: 100,
          totalDeaths: 80,
          avgIP: 1400,
          totalAttendance: 85,
          attendanceComparison: 10,
          topWeapons: ['T8_MAIN_MACE', 'T8_2H_POLEHAMMER'],
        },
        {
          rank: 4,
          name: 'SupportGuy',
          mainClass: 'Support',
          tier: 'B',
          totalKills: 120,
          totalDeaths: 90,
          avgIP: 1250,
          totalAttendance: 75,
          attendanceComparison: -5,
          topWeapons: ['T8_MAIN_ARCANESTAFF', 'T8_2H_ARCANESTAFF'],
        },
        {
          rank: 5,
          name: 'CasualPlayer',
          mainClass: 'Utility',
          tier: 'C',
          totalKills: 80,
          totalDeaths: 100,
          avgIP: 1200,
          totalAttendance: 60,
          attendanceComparison: -15,
          topWeapons: ['T8_2H_NATURESTAFF', 'T8_2H_WILDSTAFF'],
        },
      ]
    }
    setResult(mockResult)
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
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-zinc-400" />
              <Input
                value={guildName}
                onChange={(e) => setGuildName(e.target.value)}
                placeholder="Enter guild name"
                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
              />
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
          >
            Calculate Attendance
          </Button>
        </div>
      </PageHero>

      <div className="container mx-auto px-4">
        {result && <AttendanceResult result={result} />}
      </div>
    </div>
  )
}

