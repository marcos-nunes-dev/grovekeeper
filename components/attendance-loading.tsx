import { cn } from '@/lib/utils'
import { Skeleton } from './ui/skeleton'

export default function AttendanceLoading() {
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
            {Array.from({ length: 10 }).map((_, index) => (
              <tr
                key={index}
                className={cn(
                  "transition-colors",
                  index % 2 === 0 ? "bg-[#0D1117]" : "bg-[#161B22]"
                )}
              >
                <td className="py-3 px-4">
                  <Skeleton className="h-4 w-8" />
                </td>
                <td className="py-3 px-4">
                  <Skeleton className="h-5 w-5 rounded-full" />
                </td>
                <td className="py-3 px-4">
                  <Skeleton className="h-4 w-32" />
                </td>
                <td className="py-3 px-4">
                  <Skeleton className="h-6 w-6 rounded" />
                </td>
                <td className="py-3 px-4">
                  <Skeleton className="h-4 w-16" />
                </td>
                <td className="py-3 px-4">
                  <Skeleton className="h-4 w-16" />
                </td>
                <td className="py-3 px-4">
                  <Skeleton className="h-4 w-12" />
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-12 rounded" />
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 