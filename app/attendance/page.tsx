"use client";

import { Button } from "@/components/ui/button";
import AttendanceResult from "@/components/attendance-result";
import GuildInfo from "@/components/guild-info";
import PageHero from "@/components/page-hero";
import { useAttendanceCalculator } from "@/lib/hooks/use-attendance-calculator";
import { BattleTypeSelector } from "@/components/attendance/battle-type-selector";
import { GuildInputs } from "@/components/attendance/guild-inputs";
import { CustomListToggle } from "@/components/attendance/custom-list-toggle";
import { ErrorDisplay } from "@/components/error-display";
import { PlayerList } from "@/components/attendance/player-list";

export default function Attendance() {
  const {
    guildId,
    battleType,
    useCustomList,
    playerNames,
    result,
    guildInfo,
    isLoading,
    error,
    handleGuildIdChange,
    setBattleType,
    setUseCustomList,
    setPlayerNames,
    handleCalculate,
    isCalculateDisabled,
  } = useAttendanceCalculator();

  return (
    <div>
      <PageHero
        title="Guild Attendance Tracker"
        subtitle="Track and analyze your guild members' participation and performance"
        stats={[
          { value: "1,000+", label: "Guilds Tracked" },
          { value: "50K+", label: "Players Analyzed" },
        ]}
      >
        <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-zinc-800 p-6 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <BattleTypeSelector
                value={battleType}
                onChange={setBattleType}
              />
              <GuildInputs
                guildId={guildId}
                onGuildIdChange={handleGuildIdChange}
              />
            </div>
          </div>

          <CustomListToggle
            checked={useCustomList}
            onCheckedChange={setUseCustomList}
          />

          {useCustomList && (
            <PlayerList
              value={playerNames}
              onChange={setPlayerNames}
            />
          )}

          <Button
            onClick={handleCalculate}
            className="w-full bg-[#00E6B4] text-black hover:bg-[#1BECA0] disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isCalculateDisabled}
          >
            {isLoading ? "Calculating..." : "Calculate Attendance"}
          </Button>

          <ErrorDisplay error={error} />
        </div>
      </PageHero>

      <div className="container mx-auto px-4">
        {!useCustomList && (
          <GuildInfo info={guildInfo} isLoading={isLoading} />
        )}
        {result && <AttendanceResult result={result} />}
      </div>
    </div>
  );
}
