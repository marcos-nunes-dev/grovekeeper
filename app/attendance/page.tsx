"use client";

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  useTransition,
} from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import AttendanceResult, {
  type AttendanceResult as AttendanceResultType,
} from "@/components/attendance-result";
import GuildInfo from "@/components/guild-info";
import PageHero from "@/components/page-hero";
import { useDebounce } from "@/lib/hooks/use-debounce";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { HelpCircle, Search } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useApiHealth } from "@/lib/hooks/useApiHealth";

type BattleType = "zvz" | "all";

interface GuildSearchResult {
  Id: string;
  Name: string;
  AllianceId: string;
  AllianceName: string;
  KillFame: number;
  DeathFame: number;
}

interface GuildStats {
  memberCount: number;
  totalKillFame: number;
  totalDeathFame: number;
  totalPvEFame: number;
  totalGatheringFame: number;
  totalCraftingFame: number;
  averageKillFame: number;
  averageDeathFame: number;
  averagePvEFame: number;
}

interface GuildSuccess {
  type: "success";
  Name: string;
  AllianceName: string | null;
  statistics: GuildStats;
}

interface GuildError {
  type: "error";
  error: string;
}

type GuildInfo = GuildSuccess | GuildError;

export default function Attendance() {
  const [guildName, setGuildName] = useState("");
  const [battleType, setBattleType] = useState<BattleType>("zvz");
  const [useCustomList, setUseCustomList] = useState(false);
  const [playerNames, setPlayerNames] = useState("");
  const [result, setResult] = useState<AttendanceResultType | null>(null);
  const [guildInfo, setGuildInfo] = useState<GuildInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [guildMembers, setGuildMembers] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<GuildSearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debouncedGuildName = useDebounce(guildName, 800);
  const [isPending, startTransition] = useTransition();
  const abortControllerRef = useRef<AbortController | null>(null);
  const searchCache = useRef<Map<string, GuildSearchResult[]>>(new Map());
  const retryTimeoutRef = useRef<NodeJS.Timeout>();
  const retryCountRef = useRef(0);
  const MAX_RETRIES = 3;
  const { isHealthy, isLoading: isHealthLoading } = useApiHealth();
  const [error, setError] = useState<string | null>(null);

  // Handle input change with immediate UI reset
  const handleGuildNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setGuildName(newValue);
      setShowSuggestions(true);
      setError(null); // Clear error when typing
      // Reset UI immediately when typing
      if (guildInfo || guildMembers.length > 0 || result) {
        setGuildInfo(null);
        setGuildMembers([]);
        setResult(null);
      }
    },
    [guildInfo, guildMembers.length, result]
  );

  // Memoize the player list calculation
  const processedPlayerList = useMemo(() => {
    if (!useCustomList) return guildMembers;

    return playerNames
      .split("\n")
      .map((line) => {
        const match = line.match(/"([^"]+)"/);
        return match ? match[1] : null;
      })
      .filter(Boolean) as string[];
  }, [useCustomList, playerNames, guildMembers]);

  // Memoize button disabled state
  const isCalculateDisabled = useMemo(() => {
    if (useCustomList) {
      return isLoading || !guildName || !playerNames.trim();
    }
    return isLoading || isSearching || !guildInfo || !guildMembers.length;
  }, [
    isLoading,
    isSearching,
    guildInfo,
    guildMembers.length,
    useCustomList,
    guildName,
    playerNames,
  ]);

  const handleExactMatch = useCallback(
    async (guild: GuildSearchResult) => {
      // Skip fetching members if using custom list
      if (useCustomList) {
        setGuildInfo({
          type: "success",
          Name: guild.Name,
          AllianceName: guild.AllianceName,
          statistics: {
            memberCount: 0,
            totalKillFame: 0,
            totalDeathFame: 0,
            totalPvEFame: 0,
            totalGatheringFame: 0,
            totalCraftingFame: 0,
            averageKillFame: 0,
            averageDeathFame: 0,
            averagePvEFame: 0,
          },
        });
        return;
      }

      try {
        setIsSearching(true);
        setError(null); // Clear error before new request
        const controller = new AbortController();
        // Set a timeout of 35 seconds
        const timeoutId = setTimeout(() => controller.abort(), 35000);

        const detailsResponse = await fetch(`/api/guilds/${guild.Id}/members`, {
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!detailsResponse.ok) {
          if (detailsResponse.status === 504) {
            setError(
              'The request timed out. The Albion API is experiencing high latency. Please try again. You can use the "Use custom member list" option to avoid this issue and faster results.'
            );
            return;
          }
          throw new Error(
            `Failed to fetch guild details: ${detailsResponse.status}`
          );
        }

        const details = await detailsResponse.json();

        startTransition(() => {
          setGuildInfo({
            type: "success",
            Name: guild.Name,
            AllianceName: guild.AllianceName,
            statistics: details.statistics,
          });
          setGuildMembers(details.members.map((m: { Name: string }) => m.Name));
        });
      } catch (error) {
        console.error("Error fetching guild details:", error);
        let errorMessage = "Failed to fetch guild details. Please try again.";

        if (error instanceof Error) {
          if (error.name === "AbortError") {
            errorMessage =
              "The request timed out. The Albion API is experiencing high latency. Please try again.";
          } else if (error.message.includes("504")) {
            errorMessage =
              "The request timed out. The Albion API is experiencing high latency. Please try again.";
          }
        }

        setError(errorMessage);
      } finally {
        setIsSearching(false);
      }
    },
    [startTransition, useCustomList]
  );

  const searchGuild = useCallback(
    async (name: string) => {
      if (!name) return;

      // Check cache first
      const cachedResult = searchCache.current.get(name.toLowerCase());
      if (cachedResult) {
        const exactMatch = cachedResult.find(
          (g) => g.Name.toLowerCase() === name.toLowerCase()
        );
        if (exactMatch) {
          handleExactMatch(exactMatch);
          return;
        }
      }

      try {
        setIsSearching(true);
        setError(null); // Clear error before new request

        // Cancel previous request if exists
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        const response = await fetch(
          `/api/guilds/search?q=${encodeURIComponent(name)}`,
          { signal: abortControllerRef.current.signal }
        );

        if (!response.ok) {
          if (response.status === 429) {
            // Rate limit
            const retryAfter = response.headers.get("Retry-After") || "5";
            if (retryTimeoutRef.current) {
              clearTimeout(retryTimeoutRef.current);
            }
            retryTimeoutRef.current = setTimeout(
              () => {
                if (retryCountRef.current < MAX_RETRIES) {
                  retryCountRef.current++;
                  searchGuild(name);
                }
              },
              parseInt(retryAfter) * 1000
            );
            return;
          }
          throw new Error("Failed to search guild");
        }

        const guilds: GuildSearchResult[] = await response.json();

        // Cache the results
        searchCache.current.set(name.toLowerCase(), guilds);

        const exactMatch = guilds.find(
          (g) => g.Name.toLowerCase() === name.toLowerCase()
        );

        if (exactMatch) {
          await handleExactMatch(exactMatch);
        } else if (guilds.length > 0) {
          setError(
            "Multiple guilds found with similar names. Please use exact guild name."
          );
        } else {
          setError("No guild found with this name.");
        }

        // Reset retry count on success
        retryCountRef.current = 0;
      } catch (error: unknown) {
        if (error instanceof Error) {
          if (error.name === "AbortError") return;
          console.error("Error searching guild:", error);
          setError(
            "Failed to search guild. The Albion API might be experiencing issues."
          );
        }
      } finally {
        setIsSearching(false);
      }
    },
    [handleExactMatch]
  );

  // Effect to fetch only suggestions when typing
  useEffect(() => {
    if (debouncedGuildName) {
      const fetchSuggestions = async () => {
        try {
          setIsSearching(true);
          setError(null); // Clear error before new request

          // Cancel previous request if exists
          if (abortControllerRef.current) {
            abortControllerRef.current.abort();
          }
          abortControllerRef.current = new AbortController();

          const response = await fetch(
            `/api/guilds/search?q=${encodeURIComponent(debouncedGuildName)}`,
            { signal: abortControllerRef.current.signal }
          );

          if (!response.ok) {
            if (response.status === 429) {
              // Rate limit
              const retryAfter = response.headers.get("Retry-After") || "5";
              if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
              }
              retryTimeoutRef.current = setTimeout(
                () => {
                  if (retryCountRef.current < MAX_RETRIES) {
                    retryCountRef.current++;
                    fetchSuggestions();
                  }
                },
                parseInt(retryAfter) * 1000
              );
              return;
            }
            throw new Error("Failed to search guild");
          }

          const guilds: GuildSearchResult[] = await response.json();
          setSuggestions(guilds);

          // Cache the results
          searchCache.current.set(debouncedGuildName.toLowerCase(), guilds);

          // Reset retry count on success
          retryCountRef.current = 0;
        } catch (error: unknown) {
          if (error instanceof Error) {
            if (error.name === "AbortError") return;
            console.error("Error searching guild:", error);
            setError(
              "Failed to search for guilds. The Albion API might be experiencing issues."
            );
          }
        } finally {
          setIsSearching(false);
        }
      };

      fetchSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [debouncedGuildName]);

  const handleSuggestionClick = useCallback(
    (guild: GuildSearchResult) => {
      setGuildName(guild.Name);
      setShowSuggestions(false);
      handleExactMatch(guild);
    },
    [handleExactMatch]
  );

  // Handle form submission for manual entry
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!guildName) return;

      const cachedResults = searchCache.current.get(guildName.toLowerCase());
      const exactMatch = cachedResults?.find(
        (g) => g.Name.toLowerCase() === guildName.toLowerCase()
      );

      if (exactMatch) {
        handleExactMatch(exactMatch);
      } else {
        searchGuild(guildName);
      }
    },
    [guildName, searchGuild, handleExactMatch]
  );

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  const handleCalculate = useCallback(async () => {
    if (!guildName) return;
    if (useCustomList && !playerNames.trim()) return;

    try {
      setIsLoading(true);

      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          guildName,
          playerList: processedPlayerList,
          minGP: battleType === "zvz" ? 20 : 10,
          guildInfo:
            guildInfo && guildInfo.type === "success" && !useCustomList
              ? {
                  killFame: guildInfo.statistics.totalKillFame,
                  deathFame: guildInfo.statistics.totalDeathFame,
                  memberCount: guildInfo.statistics.memberCount,
                }
              : null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch attendance data");
      }

      const data = await response.json();
      setResult({ players: data.players });
    } catch (error) {
      console.error("Error calculating attendance:", error);
    } finally {
      setIsLoading(false);
    }
  }, [
    guildName,
    useCustomList,
    playerNames,
    processedPlayerList,
    battleType,
    guildInfo,
  ]);

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
          <form onSubmit={handleSubmit} className="space-y-2">
            <div className="flex items-center gap-4">
              <Select
                value={battleType}
                onValueChange={(value: BattleType) => setBattleType(value)}
              >
                <SelectTrigger className="w-[180px] border-0 bg-transparent">
                  <SelectValue placeholder="Battle Type" />
                </SelectTrigger>
                <SelectContent className="bg-[#161B22] border-zinc-800">
                  <SelectItem value="zvz">Only ZvZ</SelectItem>
                  <SelectItem value="all">ZvZ and Small</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2 flex-1 relative">
                <Search className="w-5 h-5 text-zinc-400" />
                <Input
                  value={guildName}
                  onChange={handleGuildNameChange}
                  placeholder="Enter guild name"
                  className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => {
                    // Delay hiding suggestions to allow click events
                    setTimeout(() => setShowSuggestions(false), 200);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-[100]">
                    <Card className="w-full bg-[#161B22] border-zinc-800 shadow-lg">
                      <CardContent className="p-0">
                        <div className="max-h-[300px] overflow-y-auto">
                          {suggestions.map((guild) => (
                            <button
                              key={guild.Id}
                              className="w-full px-4 py-2 text-left hover:bg-zinc-800/50 transition-colors"
                              onClick={() => handleSuggestionClick(guild)}
                              type="button"
                            >
                              <div className="font-medium">{guild.Name}</div>
                              {guild.AllianceName && (
                                <div className="text-sm text-zinc-400">
                                  Alliance: {guild.AllianceName}
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                        <div className="p-2 text-xs text-zinc-500 border-t border-zinc-800">
                          Note: Albion API responses may be slow. Please be
                          patient.
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={`w-2 h-2 rounded-full transition-colors ${
                          isHealthLoading
                            ? "bg-yellow-500"
                            : isHealthy
                              ? "bg-green-500"
                              : "bg-red-500"
                        }`}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {isHealthLoading
                          ? "Checking API status..."
                          : isHealthy
                            ? "Albion API is operational"
                            : "Albion API is down"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </form>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch
                checked={useCustomList}
                onCheckedChange={setUseCustomList}
              />
              <div className="flex flex-col">
                <Label className="text-sm text-zinc-400">
                  Use custom member list
                </Label>
                <small className="text-xs text-zinc-400">
                  Good option when Guild members API is down
                </small>
              </div>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-zinc-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    The list of player names can be found in the copy and paste
                    function at the guild management option inside the game.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {useCustomList && (
            <div className="space-y-2">
              <Textarea
                value={playerNames}
                onChange={(e) => setPlayerNames(e.target.value)}
                placeholder="Enter player names (one per line)"
                className="min-h-[100px] bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
              />
              <div className="h-px bg-zinc-800" />
            </div>
          )}

          <Button
            onClick={handleCalculate}
            className="w-full bg-[#00E6B4] text-black hover:bg-[#1BECA0] disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isCalculateDisabled || isPending}
          >
            {isLoading
              ? "Calculating..."
              : isPending
                ? "Loading Guild..."
                : isSearching
                  ? "Searching Guild..."
                  : "Calculate Attendance"}
          </Button>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500">
              <p className="text-sm">{error}</p>
            </div>
          )}
        </div>
      </PageHero>

      <div className="container mx-auto px-4">
        {!useCustomList && (
          <GuildInfo info={guildInfo} isLoading={isSearching || isPending} />
        )}
        {result && <AttendanceResult result={result} />}
      </div>
    </div>
  );
}
