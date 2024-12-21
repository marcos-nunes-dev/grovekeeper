import { Card } from "@/components/ui/card"
import { History, AlertCircle, Loader2, Clock } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
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
  hasDeepSearched?: boolean
}

interface ErrorResponse {
  error: string
  details?: string
  data?: never
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
  const [isDeepSearching, setIsDeepSearching] = useState(false)
  const [hasDeepSearched, setHasDeepSearched] = useState(false)
  const eventSourceRef = useRef<EventSource | null>(null)

  // Reset states when playerName changes
  useEffect(() => {
    setHasDeepSearched(false)
    setGuildHistory([])
    setError(null)
    setCacheStatus({ isStale: false, isUpdating: true })
  }, [playerName])

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
            if (update.hasDeepSearched) {
              setHasDeepSearched(true)
            }
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
        if ('hasDeepSearched' in data && data.hasDeepSearched) {
          setHasDeepSearched(true)
        }
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

  const handleDeepSearch = async () => {
    try {
      setIsDeepSearching(true)
      setError(null)

      // Close existing EventSource if any
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }

      // Start SSE connection for deep search
      const eventSource = new EventSource(
        `/api/player/${encodeURIComponent(playerName)}/history/updates?region=${region}&deep=true`
      )
      eventSourceRef.current = eventSource

      eventSource.onmessage = (event) => {
        const update = JSON.parse(event.data)
        if ('error' in update) {
          setCacheStatus({ isStale: true, isUpdating: false })
          if (update.error === "Historical data has already been fetched for this player") {
            setHasDeepSearched(true)
          }
        } else {
          setGuildHistory(update.data)
          setCacheStatus(update.cacheStatus)
        }
      }

      eventSource.onerror = () => {
        eventSource.close()
        setCacheStatus(prev => ({ ...prev, isUpdating: false, isStale: true }))
      }

      // Make the initial deep search request
      const response = await fetch(
        `/api/player/${encodeURIComponent(playerName)}/history?region=${region}&deep=true`
      )
      const data = await response.json() as ApiResponse

      if (!response.ok || isErrorResponse(data)) {
        const errorMessage = isErrorResponse(data) ? data.error : 'Failed to fetch guild history'
        if (errorMessage === "Historical data has already been fetched for this player") {
          setHasDeepSearched(true)
        }
        throw new Error(errorMessage)
      }

      setGuildHistory(data.data)
      setCacheStatus(data.cacheStatus)
    } catch (err) {
      console.error('Error in deep search:', err)
      const message = err instanceof Error ? err.message : 'Failed to load historical data'
      if (message === "Historical data has already been fetched for this player") {
        setHasDeepSearched(true)
      } else {
        setError(message)
      }
    } finally {
      setIsDeepSearching(false)
    }
  }

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
        <>
          <div className="space-y-4">
            {guildHistory.map((guild, index) => (
              <div key={index} className="flex items-center gap-3">
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarFallback className="bg-zinc-800/50 text-zinc-300">
                    {guild.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <span className="font-medium truncate">{guild.name}</span>
                  </div>
                  <div className="text-xs text-zinc-400 truncate">
                    Last seen: {guild.seenAt}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!hasDeepSearched && (
            <div className="mt-4 pt-4 border-t border-zinc-800">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-zinc-400 hover:text-zinc-300"
                      onClick={handleDeepSearch}
                      disabled={isDeepSearching || cacheStatus.isUpdating}
                    >
                      {isDeepSearching ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Clock className="h-4 w-4 mr-2" />
                      )}
                      {isDeepSearching ? 'Searching Historical Data...' : 'Search Historical Data'}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" align="center">
                    <p>Search for very old guild records. This might take a while.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </>
      )}
    </Card>
  )
} 