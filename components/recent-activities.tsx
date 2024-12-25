import { memo } from 'react';
import Image from 'next/image';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RecentActivitiesProps } from '@/types/components';
import { formatFame, formatTimeAgo } from '@/lib/utils/format';
import { Skull, Swords, Heart, Shield, Users, Clock, ExternalLink, Loader2, HandHelping } from 'lucide-react';
import { AlbionLoadout, MurderLedgerEvent } from '@/types/albion';

function EventSkeleton({ count = 3 }) {
  return (
    <div className="space-y-3">
      {[...Array(count)].map((_, i) => (
        <Card key={i} className="bg-[#0D1117] border-zinc-800/50 p-3 rounded-lg animate-pulse">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-16 h-4 bg-zinc-800 rounded" />
                <div className="w-12 h-4 bg-zinc-800 rounded" />
                <div className="w-24 h-4 bg-zinc-800 rounded" />
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-20 h-8 bg-zinc-800 rounded" />
                <div className="w-32 h-4 bg-zinc-800 rounded" />
                <div className="w-24 h-4 bg-zinc-800 rounded" />
              </div>
              <div className="flex gap-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="w-10 h-10 bg-zinc-800 rounded" />
                ))}
              </div>
            </div>
            <div className="flex gap-8">
              <div className="space-y-1">
                <div className="w-24 h-4 bg-zinc-800 rounded" />
                <div className="w-20 h-3 bg-zinc-800 rounded" />
              </div>
              <div className="space-y-1">
                <div className="w-24 h-4 bg-zinc-800 rounded" />
                <div className="w-20 h-3 bg-zinc-800 rounded" />
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

const RecentActivities = memo(({ 
  events, 
  isCheckingNewEvents, 
  playerName,
  onLoadMore,
  isLoadingMore = false,
  hasMoreEvents = true
}: RecentActivitiesProps) => {
  if (events.length === 0) {
    return (
      <Card className="bg-[#0D1117] border-zinc-800/50 p-6 rounded-lg">
        <div className="text-center text-zinc-400">
          No recent activities found
        </div>
      </Card>
    );
  }

  const renderEquipment = (loadout: AlbionLoadout) => {
    const slots = ['main_hand', 'off_hand', 'head', 'body', 'shoe', 'bag', 'cape', 'mount'] as const;
    return (
      <div className="flex gap-1">
        {slots.map((slot) => {
          const item = loadout[slot];
          if (!item?.id) return null;
          
          return (
            <div key={slot} className="w-8 h-8 bg-zinc-900 rounded border border-zinc-800">
              <Image
                src={`https://render.albiononline.com/v1/item/${item.id}.png`}
                alt={item.en_name}
                width={32}
                height={32}
                className="w-full h-full object-contain"
              />
            </div>
          );
        })}
      </div>
    );
  };

  const getEventType = (event: MurderLedgerEvent) => {
    const playerNameLower = (playerName || '').toLowerCase();
    const isKiller = event.killer.name.toLowerCase() === playerNameLower && event.killer.is_primary;
    const isVictim = event.victim.name.toLowerCase() === playerNameLower;
    const isAssist = !isVictim && 
                    event.killer.name.toLowerCase() === playerNameLower && 
                    !event.killer.is_primary;

    return { isKiller, isVictim, isAssist };
  };

  const getBorderClass = (eventType: { isKiller: boolean, isVictim: boolean, isAssist: boolean }) => {
    if (eventType.isKiller) return 'border-green-500/20';
    if (eventType.isVictim) return 'border-red-500/20';
    if (eventType.isAssist) return 'border-blue-500/20';
    return 'border-zinc-800/50';
  };

  const getPlayerIcon = (eventType: { isKiller: boolean, isVictim: boolean, isAssist: boolean }) => {
    if (eventType.isKiller) return <Swords className="w-4 h-4 text-green-500" />;
    if (eventType.isVictim) return <Skull className="w-4 h-4 text-red-500" />;
    if (eventType.isAssist) return <HandHelping className="w-4 h-4 text-blue-500" />;
    return null;
  };

  return (
    <div className="flex flex-col h-[800px]">
      <div className="flex-1 overflow-y-auto space-y-3 pr-2 
        scrollbar-thin scrollbar-track-zinc-900 scrollbar-thumb-zinc-800 
        hover:scrollbar-thumb-zinc-700 scrollbar-thumb-rounded-full">
        {isCheckingNewEvents && <EventSkeleton count={1} />}
        {events.map((event) => {
          const eventType = getEventType(event);
          
          return (
            <Card 
              key={event.id} 
              className={`bg-[#0D1117] border-zinc-800/50 p-3 rounded-lg ${getBorderClass(eventType)}`}
            >
              <div className="flex flex-col gap-3">
                {/* Top row - Time and match type */}
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    {formatTimeAgo(event.time)}
                    {event.tags.fair && <span className="text-green-500">(Fair Fight)</span>}
                    {event.tags.unfair && <span className="text-yellow-500">(Unfair Fight)</span>}
                    {event.tags.is_1v1 ? '1v1' : event.tags.is_2v2 ? '2v2' : event.tags.is_5v5 ? '5v5' : event.tags.is_zvz ? 'ZvZ' : 'PvP'}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3 h-3" />
                    {event.participant_count} Players
                  </div>
                </div>

                {/* Player info and match stats */}
                <div className="flex items-center justify-between">
                  {/* Left side - Player info */}
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center">
                      <div className="flex items-center gap-2">
                        {eventType.isKiller || eventType.isAssist ? (
                          <>
                            {getPlayerIcon(eventType)}
                            <div className="text-sm font-medium">
                              {event.killer.name}
                            </div>
                          </>
                        ) : (
                          <>
                            <Swords className="w-4 h-4 text-green-500" />
                            <div className="text-sm font-medium">
                              {event.killer.name}
                            </div>
                          </>
                        )}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {event.killer.guild_name || 'No Guild'}
                        {event.killer.alliance_name && ` [${event.killer.alliance_name}]`}
                      </div>
                    </div>
                    <div className="text-sm text-zinc-400">vs</div>
                    <div className="flex flex-col items-center">
                      <div className="flex items-center gap-2">
                        {eventType.isVictim ? (
                          <>
                            {getPlayerIcon(eventType)}
                            <div className="text-sm font-medium">
                              {event.victim.name}
                            </div>
                          </>
                        ) : (
                          <>
                            <Skull className="w-4 h-4 text-red-500" />
                            <div className="text-sm font-medium">
                              {event.victim.name}
                            </div>
                          </>
                        )}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {event.victim.guild_name || 'No Guild'}
                        {event.victim.alliance_name && ` [${event.victim.alliance_name}]`}
                      </div>
                    </div>
                  </div>

                  {/* Middle - Match info */}
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center">
                      <div className="text-lg font-bold">
                        {formatFame(event.total_kill_fame)}
                      </div>
                      <div className="text-xs text-zinc-400">FAME</div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="text-lg font-bold">
                        {event.killer.item_power}
                      </div>
                      <div className="text-xs text-zinc-400">IP</div>
                    </div>
                  </div>
                </div>

                {/* Equipment for both players */}
                <div className="flex justify-between items-center gap-4">
                  <div className="flex-1">
                    {renderEquipment(event.killer.loadout)}
                  </div>
                  <div className="text-xs text-zinc-500">vs</div>
                  <div className="flex-1 flex justify-end">
                    {renderEquipment(event.victim.loadout)}
                  </div>
                </div>

                {/* Bottom row - Combat stats and VOD */}
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Shield className="w-3 h-3 text-blue-400" />
                      {formatFame(event.killer.damage_done)} Damage
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3 text-green-400" />
                      {formatFame(event.killer.healing_done)} Healing
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 p-0 text-xs text-zinc-400 hover:text-zinc-300"
                    onClick={() => window.open(`https://albiononline.com/en/killboard/kill/${event.id}`, '_blank')}
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Details
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      
      {/* Load More Button */}
      {hasMoreEvents && (
        <div className="pt-4 border-t border-zinc-800 mt-4">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="w-full bg-[#0D1117] border-zinc-800 hover:bg-zinc-900 text-zinc-400"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}
    </div>
  );
});

RecentActivities.displayName = 'RecentActivities';

export default RecentActivities;
