import { memo } from 'react';
import Image from 'next/image';
import { Card } from "@/components/ui/card";
import { RecentActivitiesProps } from '@/types/components';
import { formatFame, formatTimeAgo } from '@/lib/utils/format';

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

function RecentActivities({ events, isCheckingNewEvents, isLoadingInitial, playerName }: RecentActivitiesProps) {
  if (isLoadingInitial) {
    return <EventSkeleton />;
  }

  if (events.length === 0) {
    return (
      <Card className="bg-[#0D1117] border-zinc-800/50 p-6 rounded-lg">
        <div className="text-center text-zinc-400">
          No recent activities found
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {isCheckingNewEvents && <EventSkeleton count={1} />}
      {events.map((event) => {
        const isKiller = event.killer.name.toLowerCase() === (playerName || '').toLowerCase();
        const loadout = isKiller ? event.killer.loadout : event.victim.loadout;
        
        return (
          <Card 
            key={event.id} 
            className={`bg-[#0D1117] border-zinc-800/50 p-3 rounded-lg ${
              isKiller ? 'border-green-500/20' : 'border-red-500/20'
            }`}
          >
            <div className="flex items-center gap-4">
              {/* Activity Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-sm font-medium ${isKiller ? 'text-green-500' : 'text-red-500'}`}>
                    {isKiller ? 'Kill' : 'Death'}
                  </span>
                  <span className="text-sm text-zinc-400">
                    {event.tags.is_1v1 ? '1v1' : 
                     event.tags.is_2v2 ? '2v2' : 
                     event.tags.is_5v5 ? '5v5' : 
                     event.tags.is_zvz ? 'ZvZ' : 'PvP'}
                  </span>
                  <span className="text-sm text-zinc-400">{formatTimeAgo(event.time)}</span>
                </div>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-2xl font-bold">
                    {isKiller ? '1/0/0' : '0/1/0'}
                  </div>
                  <div className="text-sm text-zinc-400">
                    {formatFame(event.total_kill_fame)} Fame
                  </div>
                  <div className="text-sm text-zinc-400">
                    IP: {isKiller ? event.killer.item_power : event.victim.item_power}
                  </div>
                  {event.participant_count > 2 && (
                    <div className="text-sm text-zinc-400">
                      {event.participant_count} Players
                    </div>
                  )}
                </div>

                {/* Equipment */}
                <div className="flex gap-2">
                  {Object.entries(loadout).map(([slot, item]) => {
                    if (!item.id || ['food', 'potion'].includes(slot)) return null;
                    
                    return (
                      <div key={slot} className="w-10 h-10 bg-zinc-900 rounded border border-zinc-800">
                        <Image
                        id={item.id}
                          src={`https://render.albiononline.com/v1/item/${item.id}.png`}
                          alt={item.en_name}
                          width={40}
                          height={40}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Players */}
              <div className="flex gap-8">
                <div className="space-y-1">
                  <div className="text-sm text-zinc-400">{event.killer.name}</div>
                  <div className="text-xs text-zinc-500">{event.killer.guild_name || 'No Guild'}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-zinc-400">{event.victim.name}</div>
                  <div className="text-xs text-zinc-500">{event.victim.guild_name || 'No Guild'}</div>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

export default memo(RecentActivities);
