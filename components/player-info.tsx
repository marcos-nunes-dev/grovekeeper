import { memo } from 'react';
import Image from 'next/image';
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Share2, Check, Loader2, AlertCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PlayerInfoProps } from '@/types/components';
import { formatFame } from '@/lib/utils/format';

function PlayerInfo({ playerData, cacheStatus, onShare, copied }: PlayerInfoProps) {
  // Calculate fame percentages for progress bars
  const totalFame = playerData.killFame + playerData.pveTotal + playerData.gatheringTotal + playerData.craftingTotal;
  const pvpPercentage = (playerData.killFame / totalFame) * 100;
  const pvePercentage = (playerData.pveTotal / totalFame) * 100;
  const gatheringPercentage = (playerData.gatheringTotal / totalFame) * 100;
  const craftingPercentage = (playerData.craftingTotal / totalFame) * 100;

  return (
    <Card className="bg-[#0D1117] border-zinc-800/50 p-4 rounded-lg relative">
      <div className="absolute top-0 right-0">
          <TooltipProvider>
            {copied ? (
              <Tooltip open>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={onShare}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-[#00E6B4] border-0">
                  <div className="flex items-center gap-2 text-black">
                    <Check className="h-4 w-4" />
                    <span>Copied to clipboard!</span>
                  </div>
                </TooltipContent>
              </Tooltip>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={onShare}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <div className="flex items-center gap-2">
                    <Share2 className="h-4 w-4" />
                    <span>Share profile</span>
                  </div>
                </TooltipContent>
              </Tooltip>
            )}
          </TooltipProvider>
        </div>
      <div className="flex items-start justify-between mb-4">        
        <div className="flex items-center gap-3 -translate-x-4">
          <div className="relative w-24 h-24">
            <Image
              src="/avatar2.png"
              alt={playerData.name}
              width={64}
              height={64}
              className="w-full h-full object-cover rounded-full"
            />
            <Image
              src="/border.png"
              alt="border"
              width={64}
              height={64}
              className="absolute top-0 left-0 w-full h-full object-contain"
            />
          </div>
          <div className="flex items-start gap-2">
            <div className="flex flex-col">
              <h2 className="text-xl font-bold">{playerData.name}</h2>
              <p className="text-sm text-zinc-400">{playerData.region}</p>
            </div>
            {cacheStatus?.isUpdating ? (
              <Loader2 className="h-4 w-4 mt-2 animate-spin text-[#00E6B4]" />
            ) : cacheStatus?.isStale && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <AlertCircle className="h-4 w-4 mt-2 text-yellow-500" />
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Albion API is unstable, this data may be stale</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>        
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-zinc-400">Guild</span>
            <span>{playerData.guildName || 'No Guild'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Alliance</span>
            <span>{playerData.allianceName || 'No Alliance'}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>PvP Fame</span>
              <span className="text-[#00E6B4]">{formatFame(playerData.killFame)}</span>
            </div>
            <Progress value={pvpPercentage} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>PvE Fame</span>
              <span className="text-[#00E6B4]">{formatFame(playerData.pveTotal)}</span>
            </div>
            <Progress value={pvePercentage} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Gathering Fame</span>
              <span className="text-[#00E6B4]">{formatFame(playerData.gatheringTotal)}</span>
            </div>
            <Progress value={gatheringPercentage} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Crafting Fame</span>
              <span className="text-[#00E6B4]">{formatFame(playerData.craftingTotal)}</span>
            </div>
            <Progress value={craftingPercentage} className="h-2" />
          </div>
        </div>
      </div>
    </Card>
  );
}

export default memo(PlayerInfo);
