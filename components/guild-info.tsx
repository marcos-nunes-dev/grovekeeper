import { Users, Swords, Skull, Target, Pickaxe, Hammer } from 'lucide-react'
import { formatFame } from '@/lib/utils/format'

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

interface Props {
  info: GuildInfo | null
  isLoading: boolean
}

function StatCardSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-lg bg-[#0D1117] border border-zinc-800/50">
      <div className="p-2 rounded-lg bg-[#161B22] animate-pulse">
        <div className="w-5 h-5 bg-zinc-800 rounded" />
      </div>
      <div className="space-y-2 flex-1">
        <div className="h-4 bg-zinc-800 rounded w-20 animate-pulse" />
        <div className="h-6 bg-zinc-800 rounded w-32 animate-pulse" />
      </div>
    </div>
  )
}

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  subValue,
  valueClassName = "" 
}: { 
  icon: React.ElementType
  label: string
  value: string | number
  subValue?: string
  valueClassName?: string 
}) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-lg bg-[#0D1117] border border-zinc-800/50">
      <div className="p-2 rounded-lg bg-[#161B22]">
        <Icon className="w-5 h-5 text-[#00E6B4]" />
      </div>
      <div>
        <p className="text-sm text-zinc-400">{label}</p>
        <p className={`text-lg font-medium ${valueClassName}`}>{value}</p>
        {subValue && (
          <p className="text-xs text-zinc-500">
            {subValue}
          </p>
        )}
      </div>
    </div>
  )
}

export default function GuildInfo({ info, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-zinc-800/50 bg-[#161B22] p-6 mb-6">
        <div className="flex flex-col gap-6">
          <div className="space-y-2">
            <div className="h-8 bg-zinc-800 rounded w-64 animate-pulse" />
            <div className="h-4 bg-zinc-800 rounded w-40 animate-pulse" />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!info || info.type === 'error') {
    return null
  }

  const { Name, AllianceName, statistics } = info

  return (
    <div className="rounded-lg border border-zinc-800/50 bg-[#161B22] p-6 mb-6">
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-bold mb-1">{Name}</h2>
          {AllianceName && (
            <p className="text-zinc-400 text-sm">
              <span className="text-zinc-500">Alliance:</span> {AllianceName}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            icon={Users}
            label="Members"
            value={statistics.memberCount}
          />
          <StatCard
            icon={Swords}
            label="Kill Fame"
            value={formatFame(statistics.totalKillFame)}
            subValue={`${formatFame(statistics.averageKillFame)} per member`}
            valueClassName="text-green-500"
          />
          <StatCard
            icon={Skull}
            label="Death Fame"
            value={formatFame(statistics.totalDeathFame)}
            subValue={`${formatFame(statistics.averageDeathFame)} per member`}
            valueClassName="text-red-500"
          />
          <StatCard
            icon={Target}
            label="PvE Fame"
            value={formatFame(statistics.totalPvEFame)}
            subValue={`${formatFame(statistics.averagePvEFame)} per member`}
          />
          <StatCard
            icon={Pickaxe}
            label="Gathering Fame"
            value={formatFame(statistics.totalGatheringFame)}
          />
          <StatCard
            icon={Hammer}
            label="Crafting Fame"
            value={formatFame(statistics.totalCraftingFame)}
          />
        </div>
      </div>
    </div>
  )
} 