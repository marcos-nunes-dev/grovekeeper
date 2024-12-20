import { cn } from '@/lib/utils'
import { Sword, Shield, Cross, Zap, Headphones } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import Image from 'next/image'

interface PlayerAttendance {
  name: string
  rank: number
  mainClass: 'DPS' | 'Tank' | 'Healer' | 'Support' | 'Utility'
  tier: 'S' | 'A' | 'B' | 'C'
  totalKills: number
  totalDeaths: number
  avgIP: number
  totalAttendance: number
  attendanceComparison: number
  topWeapons: string[] // Array of weapon IDs
}

export interface AttendanceResult {
  players: PlayerAttendance[]
}

interface AttendanceResultProps {
  result: AttendanceResult
}

const classIcons = {
  DPS: Sword,
  Tank: Shield,
  Healer: Cross,
  Support: Zap,
  Utility: Headphones,
}

function TierBadge({ tier, attendanceComparison }: { tier: PlayerAttendance['tier']; attendanceComparison: number }) {
  const colors = {
    S: 'bg-amber-500/20 text-amber-500 border-amber-500/50',
    A: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/50',
    B: 'bg-blue-500/20 text-blue-500 border-blue-500/50',
    C: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/50',
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div className={cn(
            'flex items-center justify-center w-6 h-6 rounded border',
            colors[tier]
          )}>
            {tier}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{Math.abs(attendanceComparison)}% {attendanceComparison >= 0 ? 'more' : 'less'} attendance than average</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default function AttendanceResult({ result }: AttendanceResultProps) {
  return (
    <div className="rounded-lg border border-zinc-800/50 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#161B22]">
            <tr>
              <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400 w-16">#</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400 w-12">Class</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Player</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400 w-16">Tier</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">K/D</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Avg IP</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Attendance</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Most Used</th>
            </tr>
          </thead>
          <tbody>
            {result.players.map((player) => {
              const ClassIcon = classIcons[player.mainClass]
              return (
                <tr
                  key={player.name}
                  className={cn(
                    "transition-colors",
                    "hover:bg-[#1C2128]",
                    player.rank % 2 === 0 ? "bg-[#0D1117]" : "bg-[#161B22]"
                  )}
                >
                  <td className="py-3 px-4 font-medium text-zinc-400">
                    {player.rank}
                  </td>
                  <td className="py-3 px-4">
                    <ClassIcon className="w-5 h-5 text-[#00E6B4]" />
                  </td>
                  <td className="py-3 px-4 font-medium">{player.name}</td>
                  <td className="py-3 px-4">
                    <TierBadge tier={player.tier} attendanceComparison={player.attendanceComparison} />
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-green-500">{player.totalKills}</span>
                    {' / '}
                    <span className="text-red-500">{player.totalDeaths}</span>
                  </td>
                  <td className="py-3 px-4">{player.avgIP}</td>
                  <td className="py-3 px-4">
                    {player.totalAttendance}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      {player.topWeapons.map((weaponId, index) => (
                        <div
                          key={index}
                          className="w-12 h-12 rounded bg-[#1C2128] border border-zinc-800/50 p-1"
                        >
                          <Image
                            src={`https://render.albiononline.com/v1/item/${weaponId}.png`}
                            alt="Weapon"
                            width={40}
                            height={40}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

