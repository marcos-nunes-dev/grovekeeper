import { memo, useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, TooltipProps } from 'recharts';
import { Users, Filter } from 'lucide-react';
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
import { useProfileStats } from '@/lib/hooks/useProfileStats';
import { AnimatedCounter } from '@/components/ui/animated-counter';

interface FameDataPoint {
  date: string;
  fame: number;
}

interface DailyStats {
  kills: number;
  assists: number;
  deaths: number;
  battles: Array<{ id: number; time: number }>;
}

interface DailyData {
  date: string;
  kills: number;
  assists: number;
  deaths: number;
  battles: Array<{ id: number; time: number }>;
}

const ZvZTooltip = ({ 
  active, 
  payload, 
  label 
}: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#1C2128] border border-zinc-800/50 rounded-lg p-3 space-y-3 min-w-[200px]">
        <p className="text-zinc-400 font-medium">{label}</p>
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-sm text-zinc-400">Kills</span>
            <span className="text-sm text-green-500">{data.kills}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-zinc-400">Assists</span>
            <span className="text-sm text-blue-500">{data.assists}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-zinc-400">Deaths</span>
            <span className="text-sm text-red-500">{data.deaths}</span>
          </div>
        </div>
        {data.battles && data.battles.length > 0 && (
          <div className="space-y-1 border-t border-zinc-800/50 pt-2">
            <div className="text-xs text-zinc-400 mb-1">Battles:</div>
            {data.battles.map((battle: { id: number, time: number }, index: number) => (
              <a
                key={battle.id}
                href={`https://albiononline.com/en/killboard/battles/${battle.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-xs text-[#00E6B4] hover:text-[#1BECA0] truncate"
              >
                Battle #{battle.id} ({new Date(battle.time * 1000).toLocaleTimeString()})
              </a>
            ))}
          </div>
        )}
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
  const [selectedZvZPeriod, setSelectedZvZPeriod] = useState<'7d' | '14d' | '30d' | 'all'>('7d');

  // Add profile stats
  const { data: stats, isLoading: isLoadingStats } = useProfileStats();

  // Calculate ZvZ stats from events with daily breakdown
  const calculateZvZStats = () => {
    if (!events.length) return null;

    // Filter events by selected period
    const now = new Date();
    let startDate = new Date();
    switch (selectedZvZPeriod) {
      case '14d':
        startDate.setDate(now.getDate() - 14);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case 'all':
        startDate = new Date(0); // Beginning of time
        break;
      default: // '7d'
        startDate.setDate(now.getDate() - 7);
    }

    const zvzEvents = events.filter(event => 
      event.tags.is_zvz && 
      new Date(event.time * 1000) >= startDate
    );

    if (!zvzEvents.length) return null;

    const playerNameLower = playerData.name.toLowerCase();
    let kills = 0;
    let assists = 0;
    let deaths = 0;
    let totalDamage = 0;
    let totalHealing = 0;
    let totalKillFame = 0;

    // Create daily stats
    const dailyStats = new Map<string, DailyStats>();
    
    zvzEvents.forEach(event => {
      const isKiller = event.killer.name.toLowerCase() === playerNameLower && event.killer.is_primary;
      const isAssist = event.killer.name.toLowerCase() === playerNameLower && !event.killer.is_primary;
      const isVictim = event.victim.name.toLowerCase() === playerNameLower;
      const date = new Date(event.time * 1000);
      const dateKey = `${date.getMonth() + 1}/${date.getDate()}`;

      const dayStats = dailyStats.get(dateKey) || { 
        kills: 0, 
        assists: 0,
        deaths: 0, 
        battles: []
      };

      if (isKiller) {
        kills++;
        dayStats.kills++;
        totalDamage += event.killer.damage_done;
        totalHealing += event.killer.healing_done;
        totalKillFame += event.total_kill_fame;
      }
      if (isAssist) {
        assists++;
        dayStats.assists++;
        totalDamage += event.killer.damage_done;
        totalHealing += event.killer.healing_done;
      }
      if (isVictim) {
        deaths++;
        dayStats.deaths++;
      }

      // Add battle ID if not already included
      if (!dayStats.battles.some(b => b.id === event.battle_id)) {
        dayStats.battles.push({ 
          id: event.battle_id,
          time: event.time
        });
      }

      dailyStats.set(dateKey, dayStats);
    });

    // Convert daily stats to array format for the chart
    const dailyData: DailyData[] = Array.from(dailyStats.entries())
      .map(([date, stats]) => ({
        date,
        kills: stats.kills,
        assists: stats.assists,
        deaths: stats.deaths,
        battles: stats.battles.sort((a, b) => b.time - a.time)
      }))
      .sort((a, b) => {
        const [aMonth, aDay] = a.date.split('/').map(Number);
        const [bMonth, bDay] = b.date.split('/').map(Number);
        return aMonth === bMonth ? aDay - bDay : aMonth - bMonth;
      });

    return {
      total: zvzEvents.length,
      kills,
      assists,
      deaths,
      averageDamage: totalDamage / zvzEvents.length,
      averageHealing: totalHealing / zvzEvents.length,
      totalKillFame,
      kdRatio: deaths > 0 ? ((kills + assists) / deaths).toFixed(2) : (kills + assists).toString(),
      dailyData
    };
  };

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
      <div className="col-span-12">
        {/* ZvZ Performance */}
        <Card className="bg-[#0D1117] border-zinc-800/50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-[#00E6B4]" />
              <h3 className="font-semibold">ZvZ Performance</h3>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSelectedZvZPeriod('7d')}>
                  Last 7 days
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedZvZPeriod('14d')}>
                  Last 14 days
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedZvZPeriod('30d')}>
                  Last 30 days
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedZvZPeriod('all')}>
                  All time
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {(() => {
            const zvzStats = calculateZvZStats();
            
            if (!zvzStats) {
              return (
                <div className="text-center text-zinc-400 py-4">
                  No ZvZ activities found in the recent events
                </div>
              );
            }

            return (
              <div>
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{zvzStats.total}</div>
                    <div className="text-sm text-zinc-400">Total Battles</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">{zvzStats.kills}</div>
                    <div className="text-sm text-zinc-400">Kills</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500">{zvzStats.assists}</div>
                    <div className="text-sm text-zinc-400">Assists</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-500">{zvzStats.deaths}</div>
                    <div className="text-sm text-zinc-400">Deaths</div>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-400">K/A/D Ratio</span>
                    <span className="font-medium">{zvzStats.kdRatio}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-400">Avg Damage</span>
                    <span className="font-medium">{formatFame(zvzStats.averageDamage)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-400">Avg Healing</span>
                    <span className="font-medium">{formatFame(zvzStats.averageHealing)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-400">Total Kill Fame</span>
                    <span className="font-medium text-[#00E6B4]">{formatFame(zvzStats.totalKillFame)}</span>
                  </div>
                </div>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={zvzStats.dailyData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
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
                      <Tooltip content={<ZvZTooltip />} />
                      <Bar 
                        dataKey="kills" 
                        fill="#00E6B4"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={30}
                        name="Kills"
                      />
                      <Bar 
                        dataKey="assists" 
                        fill="#3b82f6"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={30}
                        name="Assists"
                      />
                      <Bar 
                        dataKey="deaths" 
                        fill="#ef4444"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={30}
                        name="Deaths"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            );
          })()}
        </Card>
      </div>
    </div>
  );
});

export default PlayerProfile;

