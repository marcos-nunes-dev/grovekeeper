import { memo, useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, TooltipProps } from 'recharts';
import { Users, Sword, Coins, Filter } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { PlayerProfileProps } from '@/types/components';
import PlayerInfo from './player-info';
import RecentActivities from './recent-activities';
import GuildHistory from './guild-history';
import { formatFame } from '@/lib/utils/format';

// Mock data that we'll replace with real data in the future
const zvzData = [
  { date: '12/15', wins: 2, losses: 1 },
  { date: '12/16', wins: 3, losses: 2 },
  { date: '12/17', wins: 4, losses: 0 },
  { date: '12/18', wins: 1, losses: 2 },
  { date: '12/19', wins: 5, losses: 1 },
  { date: '12/20', wins: 3, losses: 1 },
  { date: '12/21', wins: 2, losses: 2 },
];

interface FameDataPoint {
  date: string;
  fame: number;
}

const CustomTooltip = ({ 
  active, 
  payload, 
  label 
}: TooltipProps<number, string> & { payload?: Array<{ value: number }> }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1C2128] border border-zinc-800/50 rounded-lg p-2 text-sm">
        <p className="text-zinc-400">{label}</p>
        <p className="font-medium text-[#00E6B4]">{formatFame(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

const PlayerProfile = memo(({ 
  playerData, 
  events,
  isCheckingNewEvents,
  shareUrl, 
  cacheStatus = { isStale: false, isUpdating: false }
}: PlayerProfileProps) => {
  const [copied, setCopied] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreEvents, setHasMoreEvents] = useState(true);
  const [fameData, setFameData] = useState<FameDataPoint[]>([]);
  const [isLoadingFame, setIsLoadingFame] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '14d' | '30d' | 'all'>('7d');

  useEffect(() => {
    const fetchFameProgression = async () => {
      if (!playerData?.name) return;
      
      try {
        setIsLoadingFame(true);
        const response = await fetch(`/api/player/${encodeURIComponent(playerData.name)}/fame-progression?period=${selectedPeriod}`);
        if (!response.ok) {
          throw new Error('Failed to fetch fame progression');
        }
        const data = await response.json();
        setFameData(data);
      } catch (error) {
        console.error('Failed to fetch fame progression:', error);
      } finally {
        setIsLoadingFame(false);
      }
    };

    fetchFameProgression();
  }, [playerData?.name, selectedPeriod]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const handleLoadMore = async () => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);

    try {
      const skip = events.length;
      const response = await fetch(`/api/player/${encodeURIComponent(playerData.name)}/events?limit=10&skip=${skip}`);
      const data = await response.json();

      if (data.data.length === 0) {
        setHasMoreEvents(false);
      }

      // Emit an event to update the parent's state
      const customEvent = new CustomEvent('loadMoreEvents', {
        detail: {
          newEvents: data.data,
          playerName: playerData.name
        }
      });
      window.dispatchEvent(customEvent);
    } catch (error) {
      console.error('Failed to load more events:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Calculate ZvZ stats
  const zvzStats = {
    total: zvzData.reduce((sum, day) => sum + day.wins + day.losses, 0),
    wins: zvzData.reduce((sum, day) => sum + day.wins, 0),
    losses: zvzData.reduce((sum, day) => sum + day.losses, 0),
  };

  // Calculate ganking stats
  const gankingStats = {
    kills: 45,
    deaths: 12,
    silverEarned: 25000000,
    silverLost: 8000000,
  };

  // Calculate data period from events
  const dataPeriod = events.length > 0 ? {
    start: new Date(events[events.length - 1].time * 1000), // Convert to Date
    end: new Date(events[0].time * 1000) // Convert to Date
  } : undefined;

  return (
    <div className="grid grid-cols-12 gap-4">
      {/* Left Sidebar */}
      <div className="col-span-3 space-y-4">
        <PlayerInfo 
          playerData={playerData}
          cacheStatus={cacheStatus}
          onShare={handleShare}
          copied={copied}
          dataPeriod={dataPeriod}
        />

        {/* Fame Progression Graph */}
        <Card className="bg-[#0D1117] border-zinc-800/50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">PVP Fame Progression</h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSelectedPeriod('7d')}>
                  Last 7 days
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedPeriod('14d')}>
                  Last 14 days
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedPeriod('30d')}>
                  Last 30 days
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedPeriod('all')}>
                  All time
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="h-[200px] w-full">
            {isLoadingFame ? (
              <div className="h-full w-full flex items-center justify-center">
                <div className="h-4 w-4 border-2 border-[#00E6B4] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={fameData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                  <CartesianGrid stroke="#27272a" strokeDasharray="4" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#71717a" 
                    axisLine={false} 
                    tickLine={false}
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#71717a" 
                    axisLine={false} 
                    tickLine={false} 
                    fontSize={12}
                    tickFormatter={formatFame}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="fame" 
                    stroke="#00E6B4" 
                    dot={false}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Guild History Widget */}
        <GuildHistory 
          playerName={playerData.name}
        />
      </div>

      {/* Main Content */}
      <div className="col-span-9 space-y-3">
        <h3 className="font-semibold text-lg px-1">Recent Activities</h3>
        <RecentActivities 
          events={events}
          isCheckingNewEvents={isCheckingNewEvents}
          playerName={playerData.name}
          onLoadMore={handleLoadMore}
          isLoadingMore={isLoadingMore}
          hasMoreEvents={hasMoreEvents}
        />
      </div>

      {/* Performance Stats */}
      <div className="col-span-12 grid grid-cols-2 gap-4">
        {/* ZvZ Performance */}
        <Card className="bg-[#0D1117] border-zinc-800/50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-5 w-5 text-[#00E6B4]" />
            <h3 className="font-semibold">ZvZ Performance (Last 7 Days)</h3>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{zvzStats.total}</div>
              <div className="text-sm text-zinc-400">Total Battles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{zvzStats.wins}</div>
              <div className="text-sm text-zinc-400">Victories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{zvzStats.losses}</div>
              <div className="text-sm text-zinc-400">Defeats</div>
            </div>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={zvzData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <CartesianGrid stroke="#27272a" strokeDasharray="4" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#71717a" 
                  axisLine={false} 
                  tickLine={false}
                  fontSize={12}
                />
                <YAxis 
                  stroke="#71717a" 
                  axisLine={false} 
                  tickLine={false}
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1C2128',
                    border: '1px solid rgba(39, 39, 42, 0.5)',
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                />
                <Bar 
                  dataKey="wins" 
                  stackId="battles"
                  fill="#00E6B4"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                  name="Victories"
                />
                <Bar 
                  dataKey="losses" 
                  stackId="battles"
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                  name="Defeats"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Ganking Performance */}
        <Card className="bg-[#0D1117] border-zinc-800/50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Sword className="h-5 w-5 text-[#00E6B4]" />
            <h3 className="font-semibold">Ganking Performance</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-zinc-400">K/D Ratio</span>
                <span className="text-lg font-bold">{(gankingStats.kills / gankingStats.deaths).toFixed(2)}</span>
              </div>
              <div className="flex gap-2 text-sm">
                <span className="text-green-500">{gankingStats.kills} kills</span>
                <span className="text-zinc-400">/</span>
                <span className="text-red-500">{gankingStats.deaths} deaths</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Coins className="h-4 w-4 text-[#00E6B4]" />
                <span className="text-sm text-zinc-400">Silver Balance</span>
              </div>
              <div className="space-y-1">
                <div className="text-sm">
                  <span className="text-green-500">+{gankingStats.silverEarned.toLocaleString()}</span>
                </div>
                <div className="text-sm">
                  <span className="text-red-500">-{gankingStats.silverLost.toLocaleString()}</span>
                </div>
                <div className="text-sm font-bold">
                  = {(gankingStats.silverEarned - gankingStats.silverLost).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={fameData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <CartesianGrid stroke="#27272a" strokeDasharray="4" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#71717a" 
                  axisLine={false} 
                  tickLine={false}
                  fontSize={12}
                />
                <YAxis 
                  stroke="#71717a" 
                  axisLine={false} 
                  tickLine={false}
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1C2128',
                    border: '1px solid rgba(39, 39, 42, 0.5)',
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="fame" 
                  stroke="#00E6B4" 
                  dot={false}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
});

PlayerProfile.displayName = 'PlayerProfile';

export default PlayerProfile;

