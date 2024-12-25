import { useCallback, useEffect, useState } from 'react';
import { Card } from './ui/card';
import { GuildHistoryProps, GuildHistoryEntry } from '@/types/components';
import { Button } from './ui/button';
import { Loader2, History } from 'lucide-react';
import { MurderLedgerEvent } from '@/types/albion';
import { Avatar, AvatarFallback } from './ui/avatar';

// Function to generate a unique color from guild name
const generateGuildColor = (guildName: string) => {
  let hash = 0;
  for (let i = 0; i < guildName.length; i++) {
    hash = guildName.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Generate more pastel/muted colors by limiting the range
  const h = Math.abs(hash) % 360;  // Hue
  const s = 25 + (Math.abs(hash >> 8) % 30);  // Saturation between 25-55%
  const l = 25 + (Math.abs(hash >> 16) % 20); // Lightness between 25-45%
  
  return `hsl(${h}, ${s}%, ${l}%)`;
};

const GuildHistory = ({ playerName }: GuildHistoryProps) => {
  const [guildHistory, setGuildHistory] = useState<GuildHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeepSearching, setIsDeepSearching] = useState(false);
  const [hasDeepSearch, setHasDeepSearch] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGuildHistory = useCallback(async () => {
    if (!playerName) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/player/${playerName}/guilds`);
      if (!response.ok) {
        throw new Error('Failed to fetch guild history');
      }
      const data = await response.json();
      if ('error' in data) {
        throw new Error(data.error);
      }
      setGuildHistory(data.guilds);
      setHasDeepSearch(data.hasDeepSearch);
    } catch (error) {
      console.error('Error fetching guild history:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch guild history');
    } finally {
      setIsLoading(false);
    }
  }, [playerName]);

  const performDeepSearch = useCallback(async () => {
    if (!playerName || isDeepSearching || hasDeepSearch) return;
    
    try {
      setIsDeepSearching(true);
      setError(null);
      const response = await fetch(`/api/player/${playerName}/guilds/deep-search`);
      if (!response.ok) {
        throw new Error('Failed to perform deep search');
      }
      const data = await response.json();
      if ('error' in data) {
        throw new Error(data.error);
      }
      setGuildHistory(data);
      setHasDeepSearch(true);
    } catch (error) {
      console.error('Error performing deep search:', error);
      setError(error instanceof Error ? error.message : 'Failed to perform deep search');
    } finally {
      setIsDeepSearching(false);
    }
  }, [playerName, isDeepSearching, hasDeepSearch]);

  useEffect(() => {
    fetchGuildHistory();
  }, [fetchGuildHistory]);

  // Listen for new events being loaded
  useEffect(() => {
    const handleLoadMore = (event: CustomEvent<{ newEvents: MurderLedgerEvent[], playerName: string }>) => {
      // Only update if the events are for the current player
      if (event.detail.playerName.toLowerCase() === playerName?.toLowerCase()) {
        fetchGuildHistory();
      }
    };

    window.addEventListener('loadMoreEvents', handleLoadMore as EventListener);
    return () => window.removeEventListener('loadMoreEvents', handleLoadMore as EventListener);
  }, [playerName, fetchGuildHistory]);

  if (isLoading) {
    return (
      <Card className="p-4 border-zinc-800/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-[#00E6B4]" />
            <h2 className="text-lg font-semibold">Guild History</h2>
          </div>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-zinc-800 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-zinc-800 rounded w-24 animate-pulse" />
                <div className="h-3 bg-zinc-800 rounded w-32 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 border-zinc-800/50">
      <div className="flex items-center mb-4">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-[#00E6B4]" />
          <h2 className="text-lg font-semibold">Guild History</h2>
        </div>
      </div>
      {error ? (
        <div className="text-center py-4 text-red-500">{error}</div>
      ) : guildHistory.length > 0 ? (
        <div className="space-y-4">
          {guildHistory.map((guild) => {
            const guildColor = generateGuildColor(guild.name);
            return (
              <div key={guild.id} className="flex items-center gap-3">
                <Avatar className="h-10 w-10 flex-shrink-0" style={{ backgroundColor: guildColor }}>
                  <AvatarFallback style={{ backgroundColor: guildColor, color: '#fff' }}>
                    {guild.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium truncate">{guild.name}</span>
                    <span className="text-sm text-zinc-500 flex-shrink-0">{guild.duration}</span>
                  </div>
                  <div className="text-sm text-zinc-500">
                    {guild.joinDate} - {guild.leaveDate}
                  </div>
                </div>
              </div>
            );
          })}
          {!hasDeepSearch && (
            <div className="pt-4 border-t border-zinc-800">
              <Button
                variant="outline"
                size="sm"
                onClick={performDeepSearch}
                disabled={isDeepSearching}
                className="w-full bg-[#0D1117] border-zinc-800 hover:bg-zinc-900 text-zinc-400"
              >
                {isDeepSearching ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  'Deep Search'
                )}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="text-center py-4 text-zinc-500">No guild history found</div>
          {!hasDeepSearch && (
            <Button
              variant="outline"
              size="sm"
              onClick={performDeepSearch}
              disabled={isDeepSearching}
              className="w-full bg-[#0D1117] border-zinc-800 hover:bg-zinc-900 text-zinc-400 mt-4"
            >
              {isDeepSearching ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                'Deep Search'
              )}
            </Button>
          )}
        </>
      )}
    </Card>
  );
};

export default GuildHistory; 