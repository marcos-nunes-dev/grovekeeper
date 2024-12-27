import { cn } from '@/lib/utils'
import { Sword, Shield, Cross, Zap, Headphones } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import Image from 'next/image'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"

interface ComparisonData {
  current: {
    kd: number
    guildName: string
    guildSize: number
  }
  similar: {
    kd: number
    guildName: string
    guildSize: number
  } | null
  best: {
    kd: number
    guildName: string
    guildSize: number
  } | null
}

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
  topWeapons: string[]
  comparison?: ComparisonData | null
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

function KDComparison({ data, playerClass }: { data: ComparisonData, playerClass: PlayerAttendance['mainClass'] }) {
  const chartData = [
    ...(data.similar ? [{
      name: 'Similar Guild',
      kd: data.similar.kd,
      guildName: data.similar.guildName,
      guildSize: data.similar.guildSize
    }] : []),
    ...(data.best ? [{
      name: 'Best Guild',
      kd: data.best.kd,
      guildName: data.best.guildName,
      guildSize: data.best.guildSize
    }] : [])
  ]

  const playerKD = data.current.kd
  const similarKD = data.similar?.kd || 0
  const bestKD = data.best?.kd || 0

  // Calculate percentages compared to player's K/D
  const similarComparison = similarKD ? ((playerKD / similarKD) * 100 - 100) : null
  const bestComparison = bestKD ? ((playerKD / bestKD) * 100 - 100) : null

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-2">
        <h3 className="font-semibold">K/D Ratio Comparison ({playerClass})</h3>
        <p className="text-sm text-zinc-400">Your K/D: {playerKD.toFixed(2)}</p>
        {similarComparison !== null && (
          <p className="text-sm text-zinc-400">
            {similarComparison > 0 
              ? <span className="text-green-400">+{similarComparison.toFixed(1)}%</span>
              : <span className="text-red-400">{similarComparison.toFixed(1)}%</span>
            } compared to similar guild
          </p>
        )}
        {bestComparison !== null && (
          <p className="text-sm text-zinc-400">
            {bestComparison > 0 
              ? <span className="text-green-400">+{bestComparison.toFixed(1)}%</span>
              : <span className="text-red-400">{bestComparison.toFixed(1)}%</span>
            } compared to best guild
          </p>
        )}
      </div>
      
      <div className="h-[200px] w-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis domain={[0, 'auto']} />
            <RechartsTooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload
                  return (
                    <div className="bg-[#161B22] border border-zinc-800 rounded-lg p-2 text-sm">
                      <p className="font-semibold">{data.guildName}</p>
                      <p className="text-zinc-400">Guild Size: {data.guildSize}</p>
                      <p className="text-zinc-400">K/D: {data.kd.toFixed(2)}</p>
                    </div>
                  )
                }
                return null
              }}
            />
            <Bar 
              dataKey="kd" 
              fill="#00E6B4" 
              radius={[4, 4, 0, 0]}
            >
              <ReferenceLine y={playerKD} stroke="#ffffff" strokeDasharray="3 3" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
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
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <ClassIcon className="w-5 h-5 text-[#00E6B4]" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{player.mainClass}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </td>
                  <td className="py-3 px-4 font-medium">{player.name}</td>
                  <td className="py-3 px-4">
                    <TierBadge tier={player.tier} attendanceComparison={player.attendanceComparison} />
                  </td>
                  <td className="py-3 px-4">
                    {player.comparison ? (
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <div className="flex gap-1 cursor-help">
                            <span className="text-green-500">{player.totalKills}</span>
                            <span>/</span>
                            <span className="text-red-500">{player.totalDeaths}</span>
                          </div>
                        </HoverCardTrigger>
                        <HoverCardContent side="right" className="w-[350px] p-0">
                          <KDComparison data={player.comparison} playerClass={player.mainClass} />
                        </HoverCardContent>
                      </HoverCard>
                    ) : (
                      <div className="flex gap-1">
                        <span className="text-green-500">{player.totalKills}</span>
                        <span>/</span>
                        <span className="text-red-500">{player.totalDeaths}</span>
                      </div>
                    )}
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

