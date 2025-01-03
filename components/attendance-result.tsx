import React from 'react'
import { cn } from '@/lib/utils'
import { Sword, Shield, Cross, Zap, Headphones, Swords, Heart, LucideIcon } from 'lucide-react'
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
import { useMemo } from 'react'

interface ComparisonData {
  current: {
    kd: number
    guildName: string
    guildSize: number
    avgIP: number
    performance: number
  }
  similar: {
    kd: number
    guildName: string
    guildSize: number
    avgIP: number
    performance: number
  } | null
  best: {
    kd: number
    guildName: string
    guildSize: number
    avgIP: number
    performance: number
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
  totalDamage: number
  totalHealing: number
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

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toString()
}

function getRelevantStat(player: PlayerAttendance): { value: string; label: string; icon: LucideIcon } {
  switch (player.mainClass) {
    case 'DPS':
    case 'Tank':
      return { value: formatNumber(player.totalDamage), label: 'Damage', icon: Swords }
    case 'Healer':
      return { value: formatNumber(player.totalHealing), label: 'Healing', icon: Heart }
    case 'Support':
      return player.totalDamage > player.totalHealing 
        ? { value: formatNumber(player.totalDamage), label: 'Damage', icon: Swords }
        : { value: formatNumber(player.totalHealing), label: 'Healing', icon: Heart }
    default:
      return { value: '0', label: 'Damage', icon: Swords }
  }
}

function IPComparison({ data, playerClass }: { data: ComparisonData, playerClass: PlayerAttendance['mainClass'] }) {
  const chartData = [
    ...(data.similar ? [{
      name: 'Similar Guild',
      ip: data.similar.avgIP,
      guildName: data.similar.guildName,
      guildSize: data.similar.guildSize
    }] : []),
    ...(data.best ? [{
      name: 'Best Guild',
      ip: data.best.avgIP,
      guildName: data.best.guildName,
      guildSize: data.best.guildSize
    }] : [])
  ]

  const playerIP = data.current.avgIP
  const similarIP = data.similar?.avgIP || 0
  const bestIP = data.best?.avgIP || 0

  // Calculate percentages compared to player's IP
  const similarComparison = similarIP ? ((playerIP / similarIP) * 100 - 100) : null
  const bestComparison = bestIP ? ((playerIP / bestIP) * 100 - 100) : null

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-2">
        <h3 className="font-semibold">Average IP Comparison ({playerClass})</h3>
        <p className="text-sm text-zinc-400">Your IP: {playerIP}</p>
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
                      <p className="text-zinc-400">IP: {data.ip}</p>
                    </div>
                  )
                }
                return null
              }}
            />
            <Bar 
              dataKey="ip" 
              fill="#00E6B4" 
              radius={[4, 4, 0, 0]}
            >
              <ReferenceLine y={playerIP} stroke="#ffffff" strokeDasharray="3 3" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function PerformanceComparison({ data, playerClass }: { data: ComparisonData, playerClass: PlayerAttendance['mainClass'] }) {
  const chartData = [
    ...(data.similar ? [{
      name: 'Similar Guild',
      performance: data.similar.performance,
      guildName: data.similar.guildName,
      guildSize: data.similar.guildSize
    }] : []),
    ...(data.best ? [{
      name: 'Best Guild',
      performance: data.best.performance,
      guildName: data.best.guildName,
      guildSize: data.best.guildSize
    }] : [])
  ]

  const playerPerformance = data.current.performance
  const similarPerformance = data.similar?.performance || 0
  const bestPerformance = data.best?.performance || 0

  // Calculate percentages compared to player's performance
  const similarComparison = similarPerformance ? ((playerPerformance / similarPerformance) * 100 - 100) : null
  const bestComparison = bestPerformance ? ((playerPerformance / bestPerformance) * 100 - 100) : null

  const label = playerClass === 'Healer' ? 'Healing' : 'Damage'

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-2">
        <h3 className="font-semibold">{label} Comparison ({playerClass})</h3>
        <p className="text-sm text-zinc-400">Your {label}: {formatNumber(playerPerformance)}</p>
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
                      <p className="text-zinc-400">{label}: {formatNumber(data.performance)}</p>
                    </div>
                  )
                }
                return null
              }}
            />
            <Bar 
              dataKey="performance" 
              fill="#00E6B4" 
              radius={[4, 4, 0, 0]}
            >
              <ReferenceLine y={playerPerformance} stroke="#ffffff" strokeDasharray="3 3" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default function AttendanceResult({ result }: AttendanceResultProps) {
  // Memoize the sorted players array
  const sortedPlayers = useMemo(() => {
    return [...result.players].sort((a, b) => b.totalAttendance - a.totalAttendance)
  }, [result.players])

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
              <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Performance</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Most Used</th>
            </tr>
          </thead>
          <tbody>
            {sortedPlayers.map((player) => {
              const ClassIcon = classIcons[player.mainClass]
              const relevantStat = getRelevantStat(player)
              
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
                  <td className="py-3 px-4">
                    {player.comparison ? (
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <div className="cursor-help">{player.avgIP}</div>
                        </HoverCardTrigger>
                        <HoverCardContent side="right" className="w-[350px] p-0">
                          <IPComparison data={player.comparison} playerClass={player.mainClass} />
                        </HoverCardContent>
                      </HoverCard>
                    ) : (
                      player.avgIP
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {player.totalAttendance}
                  </td>
                  <td className="py-3 px-4">
                    {player.comparison ? (
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <div className="flex items-center gap-2 text-[#00E6B4] cursor-help">
                            <relevantStat.icon className="w-4 h-4" />
                            <span>{relevantStat.value}</span>
                          </div>
                        </HoverCardTrigger>
                        <HoverCardContent side="right" className="w-[350px] p-0">
                          <PerformanceComparison data={player.comparison} playerClass={player.mainClass} />
                        </HoverCardContent>
                      </HoverCard>
                    ) : (
                      <div className="flex items-center gap-2 text-[#00E6B4]">
                        <relevantStat.icon className="w-4 h-4" />
                        <span>{relevantStat.value}</span>
                      </div>
                    )}
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

