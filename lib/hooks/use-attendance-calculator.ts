import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import type { AttendanceResult } from "@/components/attendance-result";

export type BattleType = "zvz" | "all";

export interface GuildStats {
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

export interface GuildSuccess {
  type: "success";
  Name: string;
  AllianceName: string | null;
  statistics: GuildStats;
}

export interface GuildError {
  type: "error";
  error: string;
}

export type GuildInfo = GuildSuccess | GuildError;

export function useAttendanceCalculator() {
  const [guildId, setGuildId] = useState("");
  const [battleType, setBattleType] = useState<BattleType>("zvz");
  const [useCustomList, setUseCustomList] = useState(false);
  const [playerNames, setPlayerNames] = useState("");
  const [result, setResult] = useState<AttendanceResult | null>(null);
  const [guildInfo, setGuildInfo] = useState<GuildInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [guildMembers, setGuildMembers] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const cachedGuildInfo = useRef<{ [key: string]: GuildSuccess }>({});

  // Handle input changes with immediate UI reset
  const handleGuildIdChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setGuildId(newValue);
      setError(null);
      // Reset UI immediately when typing
      if (guildInfo || guildMembers.length > 0 || result) {
        setGuildInfo(null);
        setGuildMembers([]);
        setResult(null);
      }
    },
    [guildInfo, guildMembers.length, result]
  );

  // Handle custom list toggle
  const handleCustomListToggle = useCallback((checked: boolean) => {
    setUseCustomList(checked);
    // Clear results when toggling
    setResult(null);
    setError(null);
  }, []);

  // Process player list from custom input or guild members
  const processedPlayerList = useMemo(() => {
    if (!useCustomList) return guildMembers;

    return playerNames
      .split("\n")
      .filter(line => line.trim() && !line.includes("Character Name") && !line.includes("Last Seen") && !line.includes("Roles"))
      .map((line) => {
        const match = line.match(/"([^"]+)"/);
        return match ? match[1] : line.trim();
      })
      .filter(Boolean) as string[];
  }, [useCustomList, playerNames, guildMembers]);

  // Validate input based on mode
  const isCalculateDisabled = useMemo(() => {
    if (useCustomList) {
      return isLoading || !guildId || !playerNames.trim() || processedPlayerList.length === 0;
    }
    return isLoading || !guildId;
  }, [
    isLoading,
    guildId,
    useCustomList,
    playerNames,
    processedPlayerList.length
  ]);

  // Fetch guild details with retry logic
  const fetchGuildDetails = useCallback(async () => {
    const MAX_RETRIES = 4;
    const RETRY_DELAY = 3000; // 3 seconds
    let retryCount = 0;

    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const attemptFetch = async (): Promise<{
      guildInfo: GuildSuccess;
      members: string[];
    }> => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000);

        const response = await fetch(`/api/guilds/${guildId}/members`, {
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          // If it's a 504, we'll retry
          if (response.status === 504) {
            throw new Error("TIMEOUT");
          }
          // For other errors, fail immediately
          throw new Error(`Failed to fetch guild details: ${response.status}`);
        }

        const details = await response.json();
        
        // Get guild name from the first member's guild name tag
        const guildName = details.members[0]?.GuildName;
        if (!guildName) {
          throw new Error("Could not find guild name in the response");
        }

        return {
          guildInfo: {
            type: "success" as const,
            Name: guildName,
            AllianceName: details.allianceName,
            statistics: details.statistics,
          },
          members: details.members.map((m: { Name: string }) => m.Name)
        };
      } catch (error) {
        if (error instanceof Error) {
          // Only retry on timeout errors
          if (error.message === "TIMEOUT" && retryCount < MAX_RETRIES) {
            throw error;
          }
          // For timeout errors that have exceeded retries
          if (error.message === "TIMEOUT") {
            throw new Error(`The request timed out after ${retryCount + 1} attempts. The Albion API is experiencing high latency.`);
          }
        }
        // For all other errors, throw immediately
        throw error;
      }
    };

    while (retryCount < MAX_RETRIES) {
      try {
        return await attemptFetch();
      } catch (error) {
        // Only retry on timeout errors
        if (error instanceof Error && error.message === "TIMEOUT") {
          retryCount++;
          
          // If this was our last retry, throw the error
          if (retryCount === MAX_RETRIES) {
            throw new Error(`The request timed out after ${MAX_RETRIES} attempts. The Albion API is experiencing high latency.`);
          }

          // Wait before retrying
          await delay(RETRY_DELAY);
          
          // Log retry attempt
          console.log(`Retrying guild members fetch (attempt ${retryCount + 1} of ${MAX_RETRIES})...`);
          continue;
        }

        // For all other errors, throw immediately
        throw error;
      }
    }

    // This should never be reached due to the error throwing above, but TypeScript needs it
    throw new Error("Failed to fetch guild details");
  }, [guildId]);

  // Calculate attendance
  const calculateAttendance = useCallback(async (playerList: string[], guildStats: GuildSuccess | null) => {
    try {
      if (!playerList.length) {
        throw new Error("Player list is empty");
      }

      if (!guildStats) {
        throw new Error("Guild information is required");
      }

      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          guildId,
          guildName: guildStats.Name,
          playerList: playerList,
          minGP: battleType === "zvz" ? 20 : 10,
          guildInfo: {
            killFame: guildStats.statistics.totalKillFame,
            deathFame: guildStats.statistics.totalDeathFame,
            memberCount: guildStats.statistics.memberCount,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to calculate attendance");
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to calculate attendance");
    }
  }, [guildId, battleType]);

  // Main handler for calculate button
  const handleCalculate = useCallback(async () => {
    if (!guildId) return;

    setIsLoading(true);
    setError(null);

    try {
      let currentGuildInfo = guildInfo as GuildSuccess | null;
      let playerList: string[] = [];

      // Check if we have cached guild info
      if (!currentGuildInfo && cachedGuildInfo.current[guildId]) {
        currentGuildInfo = cachedGuildInfo.current[guildId];
        setGuildInfo(currentGuildInfo);
      }

      // Fetch guild details only if we don't have it cached
      if (!currentGuildInfo) {
        const details = await fetchGuildDetails();
        currentGuildInfo = details.guildInfo;
        // Cache the guild info
        cachedGuildInfo.current[guildId] = currentGuildInfo;
        
        if (!useCustomList) {
          playerList = details.members;
          setGuildMembers(details.members);
        }
        setGuildInfo(currentGuildInfo);
      }

      // Use custom list if enabled
      if (useCustomList) {
        playerList = processedPlayerList;
      } else if (!playerList.length) {
        // If not using custom list and we don't have players yet (used cached guild info)
        const details = await fetchGuildDetails();
        playerList = details.members;
        setGuildMembers(details.members);
      }

      if (!playerList.length) {
        throw new Error("No players found in the list");
      }

      // Calculate attendance with the player list
      const attendanceData = await calculateAttendance(playerList, currentGuildInfo);
      
      if (!attendanceData.players) {
        throw new Error("No attendance data returned");
      }
      
      setResult({ players: attendanceData.players });
    } catch (error) {
      console.error("Error in handleCalculate:", error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  }, [
    guildId,
    useCustomList,
    processedPlayerList,
    guildInfo,
    fetchGuildDetails,
    calculateAttendance
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
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
    setUseCustomList: handleCustomListToggle,
    setPlayerNames,
    handleCalculate,
    isCalculateDisabled,
  };
} 