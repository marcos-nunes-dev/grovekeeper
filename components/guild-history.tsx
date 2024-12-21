import { Card } from "@/components/ui/card"
import { History, AlertCircle, Loader2 } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface GuildHistoryEntry {
  name: string
  seenAt: string
}

interface CacheStatus {
  isStale: boolean
  isUpdating: boolean
}

interface SuccessResponse {
  data: GuildHistoryEntry[]
  cacheStatus: CacheStatus
}

interface ErrorResponse {
  error: string
  details?: string
}

type ApiResponse = SuccessResponse | ErrorResponse

function isErrorResponse(response: ApiResponse): response is ErrorResponse {
  return 'error' in response
}

interface GuildHistoryProps {
  playerName: string
  region: string
  currentGuild?: string
}

export default function GuildHistory({ playerName, region, currentGuild }: GuildHistoryProps) {
  const [loading, setLoading] = useState(true)
  const [guildHistory, setGuildHistory] = useState<GuildHistoryEntry[]>([])
  const [error, setError] = useState<string | null>(null)
  const [cacheStatus, setCacheStatus] = useState<CacheStatus>({ isStale: false, isUpdating: true })
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    let isMounted = true

    async function fetchGuildHistory() {
      try {
        if (!isMounted) return
        setLoading(true)
        setError(null)

        // Close existing EventSource if any
        if (eventSourceRef.current) {
          eventSourceRef.current.close()
          eventSourceRef.current = null
        }

        // Start SSE connection first
        const eventSource = new EventSource(
          `/api/player/${encodeURIComponent(playerName)}/history/updates?region=${region}`
        )
        eventSourceRef.current = eventSource

        eventSource.onmessage = (event) => {
          const update = JSON.parse(event.data)
          if ('error' in update) {
            setCacheStatus({ isStale: true, isUpdating: false })
          } else {
            setGuildHistory(update.data)
            setCacheStatus(update.cacheStatus)
          }
        }

        eventSource.onerror = () => {
          eventSource.close()
          setCacheStatus(prev => ({ ...prev, isUpdating: false, isStale: true }))
        }

        // Make the initial request
        const response = await fetch(
          `/api/player/${encodeURIComponent(playerName)}/history?region=${region}&currentGuild=${encodeURIComponent(currentGuild || '')}`
        )
        const data = await response.json() as ApiResponse

        if (!response.ok || isErrorResponse(data)) {
          const errorMessage = isErrorResponse(data) ? data.error : 'Failed to fetch guild history'
          throw new Error(errorMessage)
        }

        if (!isMounted) return
        setGuildHistory(data.data)
        setCacheStatus(data.cacheStatus)
      } catch (err) {
        if (!isMounted) return
        console.error('Error fetching guild history:', err)
        setError(err instanceof Error ? err.message : 'Failed to load guild history')
      } finally {
        if (!isMounted) return
        setLoading(false)
      }
    }

    if (playerName) {
      fetchGuildHistory()
    }

    return () => {
      isMounted = false
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
    }
  }, [playerName, region, currentGuild])

  return (
    <Card className="bg-[#0D1117] border-zinc-800/50 p-4 rounded-lg">
      <div className="flex items-center gap-2 mb-4">
        <History className="h-5 w-5 text-[#00E6B4]" />
        <h3 className="font-semibold">Guild History</h3>
        {cacheStatus.isUpdating ? (
          <Loader2 className="h-4 w-4 ml-auto animate-spin text-[#00E6B4]" />
        ) : cacheStatus.isStale && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <AlertCircle className="h-4 w-4 ml-auto text-yellow-500" />
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Albion API is unstable, this data may be stale</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="h-10 w-10 rounded-full bg-zinc-800/50" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-zinc-800/50 rounded w-24" />
                <div className="h-3 bg-zinc-800/50 rounded w-32" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <Alert variant="destructive" className="bg-red-500/10 border-red-500/20">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : guildHistory.length === 0 ? (
        <div className="text-sm text-zinc-400 text-center py-4">No guild history available</div>
      ) : (
        <div className="space-y-4">
          {guildHistory.map((guild, index) => (
            <div key={index} className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-zinc-800/50 text-zinc-300">
                  {guild.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{guild.name}</span>
                </div>
                <div className="text-xs text-zinc-400">
                  Last seen: {guild.seenAt}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
} 