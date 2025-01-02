"use client";

import { Button } from "@/components/ui/button";
import PageHero from "@/components/page-hero";
import { Suspense, useState } from "react";
import { GuildInputs } from "@/components/attendance/guild-inputs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function CanIFightContent() {
  const [guildId, setGuildId] = useState('');
  const [playerCount, setPlayerCount] = useState('');
  
  const handleGuildIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGuildId(e.target.value);
  };

  return (
    <div>
      <PageHero
        title="Can I Fight?"
        subtitle="Check if your guild can fairly fight a another guild"
      >
        <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-zinc-800 p-6 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <Select value={playerCount} onValueChange={setPlayerCount}>
                <SelectTrigger className="w-[180px] border-0 bg-transparent">
                  <SelectValue placeholder="Party size" />
                </SelectTrigger>
                <SelectContent className="bg-[#161B22] border-zinc-800">
                  <SelectItem value="road">Road/Small (up to 7)</SelectItem>
                  <SelectItem value="small">Small (up to 20)</SelectItem>
                  <SelectItem value="zvz">ZVZ (20+)</SelectItem>
                </SelectContent>
              </Select>
              <GuildInputs
                guildId={guildId}
                onGuildIdChange={handleGuildIdChange}
              />
            </div>
          </div>

          <Button
            onClick={() => {}}
            className="w-full bg-[#00E6B4] text-black hover:bg-[#1BECA0] disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!guildId || !playerCount}
          >
            Check if I can fight
          </Button>
        </div>
      </PageHero>

      <div className="container mx-auto px-4">
        {/* Result area will be added later */}
      </div>
    </div>
  );
}

export default function CanIFight() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CanIFightContent />
    </Suspense>
  );
} 