import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useRef } from 'react'
import { useEventSource } from '@/lib/hooks/useEventSource'
import { getCacheStatus } from '@/lib/utils/cache'

interface GuildHistoryProps {
  playerName: string
  region: string
  currentGuild: string | null
}

interface GuildHistoryEntry {
  name: string
  seenAt: string
}

interface ApiResponse {
  data?: GuildHistoryEntry[]
  error?: string
  details?: string
  cacheStatus?: {
    isStale: boolean
    isUpdating: boolean
  }
  hasDeepSearched?: boolean
}

export default function GuildHistory({ playerName, region, currentGuild }: GuildHistoryProps) {
  const [guildHistory, setGuildHistory] = useState<GuildHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cacheStatus, setCacheStatus] = useState<{ isStale: boolean; isUpdating: boolean }>({ isStale: false, isUpdating: true })
  const [hasDeepSearched, setHasDeepSearched] = useState(false)
  const [isDeepSearching, setIsDeepSearching] = useState(false)
  const isMounted = useRef(true)

  // Use our custom hook for normal updates
  useEventSource<ApiResponse>(
    `/api/player/${encodeURIComponent(playerName)}/history/updates?region=${region}`,
    (update) => {
      if ('error' in update) {
        setCacheStatus({ isStale: true, isUpdating: false })
      } else if (update.data) {
        setGuildHistory(update.data)
        setCacheStatus(update.cacheStatus || { isStale: false, isUpdating: false })
        if (update.hasDeepSearched) {
          setHasDeepSearched(true)
        }
      }
    },
    {
      retryOnError: true,
      maxRetries: 3,
      onError: () => {
        setCacheStatus(prev => ({ ...prev, isUpdating: false, isStale: true }))
      }
    }
  )

  // Use separate hook for deep search updates
  useEventSource<ApiResponse>(
    isDeepSearching ? `/api/player/${encodeURIComponent(playerName)}/history/updates?region=${region}&deep=true` : null,
    (update) => {
      if ('error' in update) {
        setCacheStatus({ isStale: true, isUpdating: false })
        if (update.error === "Historical data has already been fetched for this player") {
          setHasDeepSearched(true)
        }
      } else if (update.data) {
        setGuildHistory(update.data)
        setCacheStatus(update.cacheStatus || { isStale: false, isUpdating: false })
      }
    },
    {
      retryOnError: false,
      onError: () => {
        setIsDeepSearching(false)
        setCacheStatus(prev => ({ ...prev, isUpdating: false, isStale: true }))
      }
    }
  )

  useEffect(() => {
    return () => {
      isMounted.current = false
    }
  }, [])

  useEffect(() => {
    async function fetchGuildHistory() {
      try {
        if (!isMounted.current) return
        setLoading(true)
        setError(null)

        const response = await fetch(
          `/api/player/${encodeURIComponent(playerName)}/history?region=${region}&currentGuild=${encodeURIComponent(currentGuild || '')}`
        )
        const data = await response.json() as ApiResponse

        if (!isMounted.current) return

        if ('error' in data && data.error) {
          setError(data.error)
          setCacheStatus({ isStale: false, isUpdating: false })
        } else if (data.data) {
          setGuildHistory(data.data)
          setCacheStatus(data.cacheStatus || { isStale: false, isUpdating: true })
          setHasDeepSearched(data.hasDeepSearched || false)
        }
      } catch (error) {
        if (!isMounted.current) return
        setError(error instanceof Error ? error.message : 'An error occurred')
        setCacheStatus({ isStale: false, isUpdating: false })
      } finally {
        if (isMounted.current) {
          setLoading(false)
        }
      }
    }

    fetchGuildHistory()
  }, [playerName, region, currentGuild])

  const handleDeepSearch = async () => {
    try {
      setIsDeepSearching(true)
      setError(null)

      const response = await fetch(
        `/api/player/${encodeURIComponent(playerName)}/history?region=${region}&deep=true`
      )
      const data = await response.json() as ApiResponse

      if ('error' in data && data.error) {
        setError(data.error)
        if (data.error === "Historical data has already been fetched for this player") {
          setHasDeepSearched(true)
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    }
  }

  if (error) {
    return (
      <Card className="bg-[#0D1117] border-zinc-800/50 p-4 rounded-lg">
        <div className="text-red-500 text-sm">{error}</div>
      </Card>
    )
  }

  return (
    <Card className="bg-[#0D1117] border-zinc-800/50 p-4 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Guild History</h3>
        {!hasDeepSearched && !isDeepSearching && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDeepSearch}
            disabled={loading || isDeepSearching}
          >
            Deep Search
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-8 bg-zinc-800/50 rounded animate-pulse" />
          ))}
        </div>
      ) : guildHistory.length === 0 ? (
        <div className="text-zinc-400 text-sm text-center py-4">
          No guild history found
        </div>
      ) : (
        <div className="space-y-2">
          {guildHistory.map((entry, index) => (
            <div
              key={`${entry.name}-${entry.seenAt}`}
              className="flex justify-between items-center text-sm"
            >
              <span className={index === 0 ? 'text-[#00E6B4]' : 'text-zinc-400'}>
                {entry.name || 'No Guild'}
              </span>
              <span className="text-zinc-500">{entry.seenAt}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
} 