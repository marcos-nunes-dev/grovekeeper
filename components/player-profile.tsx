import { memo, useState } from 'react';
import { Card } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Sword, Coins } from 'lucide-react';
import { PlayerProfileProps } from '@/types/components';
import PlayerInfo from './player-info';
import RecentActivities from './recent-activities';
import GuildHistory from './guild-history';

// Mock data that we'll replace with real data in the future
const fameData = [
  { date: '12/13', fame: 20000 },
  { date: '12/14', fame: 22000 },
  { date: '12/15', fame: 21000 },
  { date: '12/16', fame: 25000 },
  { date: '12/17', fame: 28000 },
  { date: '12/18', fame: 27000 },
  { date: '12/19', fame: 32000 },
];

const zvzData = [
  { date: '12/15', wins: 2, losses: 1 },
  { date: '12/16', wins: 3, losses: 2 },
  { date: '12/17', wins: 4, losses: 0 },
  { date: '12/18', wins: 1, losses: 2 },
  { date: '12/19', wins: 5, losses: 1 },
  { date: '12/20', wins: 3, losses: 1 },
  { date: '12/21', wins: 2, losses: 2 },
];

function PlayerProfile({ 
  playerData, 
  events,
  isCheckingNewEvents,
  region, 
  shareUrl, 
  cacheStatus = { isStale: false, isUpdating: false }
}: PlayerProfileProps) {
  const [copied, setCopied] = useState(false);
  const [isLoadingInitial, setIsLoadingInitial] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreEvents, setHasMoreEvents] = useState(true);

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

  return (
    <div className="grid grid-cols-12 gap-4">
      {/* Left Sidebar */}
      <div className="col-span-3 space-y-4">
        <PlayerInfo 
          playerData={playerData}
          cacheStatus={cacheStatus}
          onShare={handleShare}
          copied={copied}
        />

        {/* Fame Progression Graph */}
        <Card className="bg-[#0D1117] border-zinc-800/50 p-4 rounded-lg">
          <h3 className="font-semibold mb-4">Fame Progression</h3>
          <div className="h-[200px] w-full">
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

        {/* Guild History Widget */}
        <GuildHistory 
          playerName={playerData.name} 
          region={region} 
          currentGuild={playerData.guildName}
        />
      </div>

      {/* Main Content */}
      <div className="col-span-9 space-y-3">
        <h3 className="font-semibold text-lg px-1">Recent Activities</h3>
        <RecentActivities 
          events={events}
          isCheckingNewEvents={isCheckingNewEvents}
          isLoadingInitial={isLoadingInitial}
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
}

export default memo(PlayerProfile);

