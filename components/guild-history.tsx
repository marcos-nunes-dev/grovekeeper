import { Card } from "@/components/ui/card"
import { History, AlertCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface GuildHistoryEntry {
  name: string
  seenAt: string
}

interface GuildHistoryProps {
  playerName: string
  region: string
}

export default function GuildHistory({ playerName, region }: GuildHistoryProps) {
  const [loading, setLoading] = useState(true)
  const [guildHistory, setGuildHistory] = useState<GuildHistoryEntry[]>([])
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const MAX_RETRIES = 3

  useEffect(() => {
    let isMounted = true
    let retryTimeout: NodeJS.Timeout

    async function fetchGuildHistory() {
      try {
        if (!isMounted) return
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/player/${playerName}/history?region=${region}`)
        const data = await response.json()

        if (!response.ok) {
          if (response.status === 504 && retryCount < MAX_RETRIES) {
            // Handle timeout by retrying
            setRetryCount(prev => prev + 1)
            retryTimeout = setTimeout(fetchGuildHistory, 2000) // Retry after 2 seconds
            return
          }
          throw new Error(data.error || 'Failed to fetch guild history')
        }

        if (!isMounted) return
        setGuildHistory(data)
        setRetryCount(0) // Reset retry count on success
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
      if (retryTimeout) {
        clearTimeout(retryTimeout)
      }
    }
  }, [playerName, region, retryCount])

  return (
    <Card className="bg-[#0D1117] border-zinc-800/50 p-4 rounded-lg">
      <div className="flex items-center gap-2 mb-4">
        <History className="h-5 w-5 text-[#00E6B4]" />
        <h3 className="font-semibold">Guild History</h3>
      </div>

      {loading ? (
        <div className="space-y-4">
          {retryCount > 0 && (
            <Alert variant="default" className="bg-yellow-500/10 border-yellow-500/20 text-yellow-500 mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Loading is taking longer than usual... (Attempt {retryCount}/{MAX_RETRIES})
              </AlertDescription>
            </Alert>
          )}
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