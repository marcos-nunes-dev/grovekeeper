import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendUpdate } from "@/lib/updates";
import { prismaSSE } from '@/lib/prisma-sse'

const ALBION_API = "https://gameinfo.albiononline.com/api/gameinfo";

interface AlbionSearchResponse {
  players: Array<{
    Id: string;
    Name: string;
  }>;
}

interface AlbionPlayerResponse {
  Id: string;
  Name: string;
  GuildName: string | null;
  AllianceName: string | null;
  AllianceTag: string | null;
  KillFame: number;
  DeathFame: number;
  LifetimeStatistics: {
    PvE?: {
      Total: number;
    };
    Gathering?: {
      All?: {
        Total: number;
      };
    };
    Crafting?: {
      Total: number;
    };
  };
}

async function findPlayer(playerName: string): Promise<string> {
  // Always search in Albion API first to get the latest player ID
  const searchUrl = `${ALBION_API}/search?q=${encodeURIComponent(playerName)}`;
  const response = await fetch(searchUrl);

  if (!response.ok) {
    if (response.status === 504) {
      throw new Error("Albion's server is not responding. Please try again in a few moments.");
    }
    if (response.status >= 500) {
      throw new Error("Albion's server is having issues. Please try again in a few moments.");
    }
    throw new Error(`Search failed: ${response.status}`);
  }

  try {
    const data = (await response.json()) as AlbionSearchResponse;
    const player = data.players?.find(
      (p) => p.Name.toLowerCase() === playerName.toLowerCase()
    );

    if (!player) {
      throw new Error("Player not found");
    }

    // Update the cache with the correct player ID using a transaction
    await prisma.$transaction(async (tx) => {
      const cachedPlayer = await tx.playerCache.findUnique({
        where: { playerName: playerName.toLowerCase() },
      });

      if (cachedPlayer && cachedPlayer.id !== player.Id) {
        // If the cached ID is different, update it
        await tx.playerCache.update({
          where: { playerName: playerName.toLowerCase() },
          data: { id: player.Id },
        });
      }
    });

    return player.Id;
  } catch (error) {
    if (error instanceof Error && error.message === "Player not found") {
      throw error;
    }
    throw new Error("Failed to parse Albion API response. Please try again later.");
  }
}

async function fetchPlayerData(
  playerId: string
): Promise<AlbionPlayerResponse> {
  const detailsUrl = `${ALBION_API}/players/${playerId}`;
  const response = await fetch(detailsUrl);

  if (!response.ok) {
    if (response.status === 504) {
      throw new Error("Albion's server is not responding. Please try again in a few moments.");
    }
    if (response.status >= 500) {
      throw new Error("Albion's server is having issues. Please try again in a few moments.");
    }
    throw new Error(`Failed to fetch player details: ${response.status}`);
  }

  try {
    return await response.json();
  } catch {
    throw new Error("Failed to parse Albion API response. Please try again later.");
  }
}

async function formatPlayerData(data: AlbionPlayerResponse, region: string) {
  return {
    id: data.Id,
    name: data.Name,
    guildName: data.GuildName || "",
    allianceName: data.AllianceName || "",
    allianceTag: data.AllianceTag || "",
    avatar: `https://render.albiononline.com/v1/player/${data.Name}/avatar?quality=0`,
    killFame: data.KillFame,
    deathFame: data.DeathFame,
    pveTotal: data.LifetimeStatistics?.PvE?.Total || 0,
    gatheringTotal: data.LifetimeStatistics?.Gathering?.All?.Total || 0,
    craftingTotal: data.LifetimeStatistics?.Crafting?.Total || 0,
    region,
  };
}

async function getCachedPlayer(playerName: string) {
  try {
    // Create a new Prisma transaction for this operation
    return await prisma.$transaction(async (tx) => {
      return await tx.playerCache.findUnique({
        where: { playerName: playerName.toLowerCase() },
      });
    });
  } catch (error) {
    console.error("Failed to get cached player:", error);
    return null;
  }
}

async function updatePlayerCache(data: AlbionPlayerResponse) {
  return await prismaSSE.$transaction(async (tx) => {
    const updatedPlayer = await tx.playerCache.upsert({
      where: { playerName: data.Name.toLowerCase() },
      create: {
        id: data.Id,
        playerName: data.Name.toLowerCase(),
        guildName: data.GuildName,
        killFame: BigInt(Math.floor(data.KillFame)),
        deathFame: BigInt(Math.floor(data.DeathFame)),
        pveTotal: BigInt(Math.floor(data.LifetimeStatistics?.PvE?.Total || 0)),
        gatheringTotal: BigInt(Math.floor(data.LifetimeStatistics?.Gathering?.All?.Total || 0)),
        craftingTotal: BigInt(Math.floor(data.LifetimeStatistics?.Crafting?.Total || 0))
      },
      update: {
        guildName: data.GuildName,
        killFame: BigInt(Math.floor(data.KillFame)),
        deathFame: BigInt(Math.floor(data.DeathFame)),
        pveTotal: BigInt(Math.floor(data.LifetimeStatistics?.PvE?.Total || 0)),
        gatheringTotal: BigInt(Math.floor(data.LifetimeStatistics?.Gathering?.All?.Total || 0)),
        craftingTotal: BigInt(Math.floor(data.LifetimeStatistics?.Crafting?.Total || 0))
      }
    })

    return updatedPlayer
  })
}

// Helper function to fetch fresh data from Albion API
async function fetchFreshData(playerName: string, region: string) {
  const playerId = await findPlayer(playerName);
  const playerData = await fetchPlayerData(playerId);
  const formattedData = await formatPlayerData(playerData, region);
  return { playerData, formattedData };
}

type FreshDataResult = {
  playerData: AlbionPlayerResponse;
  formattedData: {
    id: string;
    name: string;
    guildName: string;
    allianceName: string;
    allianceTag: string;
    avatar: string;
    killFame: number;
    deathFame: number;
    pveTotal: number;
    gatheringTotal: number;
    craftingTotal: number;
    region: string;
  };
}

async function processAndCachePlayerData(playerData: AlbionPlayerResponse, playerName: string, region: string) {
  // Use the existing updatePlayerCache function to maintain consistency
  await updatePlayerCache(playerData);

  // Return formatted response
  return {
    data: {
      id: playerData.Id,
      name: playerName,
      guildName: playerData.GuildName || "",
      allianceName: playerData.AllianceName || "",
      allianceTag: playerData.AllianceTag || "",
      avatar: `https://render.albiononline.com/v1/player/${playerName}/avatar?quality=0`,
      killFame: playerData.KillFame,
      deathFame: playerData.DeathFame,
      pveTotal: playerData.LifetimeStatistics.PvE?.Total || 0,
      gatheringTotal: playerData.LifetimeStatistics.Gathering?.All?.Total || 0,
      craftingTotal: playerData.LifetimeStatistics.Crafting?.Total || 0,
      region,
    },
    cacheStatus: {
      isStale: false,
      isUpdating: false,
    },
  };
}

export async function GET(
  request: Request,
  { params }: { params: { name: string } }
) {
  try {
    const playerName = params.name;
    const { searchParams } = new URL(request.url);
    const region = searchParams.get("region") || "west";

    // Try to get from cache first
    const cachedPlayer = await getCachedPlayer(playerName);

    // If we have cached data
    if (cachedPlayer) {
      // Check if cache is fresh enough (less than 3 hours old)
      const isCacheFresh = cachedPlayer.updatedAt && 
        (new Date().getTime() - cachedPlayer.updatedAt.getTime()) < 3 * 60 * 60 * 1000;

      // Return cached data
      const response = {
        data: {
          id: cachedPlayer.id,
          name: cachedPlayer.playerName,
          guildName: cachedPlayer.guildName || "",
          allianceName: "",
          allianceTag: "",
          avatar: `https://render.albiononline.com/v1/player/${cachedPlayer.playerName}/avatar?quality=0`,
          killFame: Number(cachedPlayer.killFame),
          deathFame: Number(cachedPlayer.deathFame),
          pveTotal: Number(cachedPlayer.pveTotal),
          gatheringTotal: Number(cachedPlayer.gatheringTotal),
          craftingTotal: Number(cachedPlayer.craftingTotal),
          region,
        },
        cacheStatus: {
          isStale: false,
          isUpdating: !isCacheFresh, // Only update if cache is stale
        },
      };

      // Start background update if cache is stale
      if (!isCacheFresh) {
        // Use Promise.race to timeout the background update after 10 seconds
        Promise.race([
          fetchFreshData(playerName, region),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Background update timeout')), 10000)
          )
        ])
          .then(async (result) => {
            const { playerData, formattedData } = result as FreshDataResult;
            // Update cache
            await updatePlayerCache(playerData);

            // Send fresh data via SSE
            sendUpdate(playerName, {
              data: formattedData,
              cacheStatus: {
                isStale: false,
                isUpdating: false,
              },
            });
          })
          .catch((error) => {
            console.error("Background update failed:", error);
            // Only mark as stale if it's not a timeout
            if (error.message !== 'Background update timeout') {
              sendUpdate(playerName, {
                data: response.data,
                cacheStatus: {
                  isStale: true,
                  isUpdating: false,
                },
              });
            } else {
              // For timeouts, just stop the loading state
              sendUpdate(playerName, {
                data: response.data,
                cacheStatus: {
                  isStale: false,
                  isUpdating: false,
                },
              });
            }
          });
      }

      return NextResponse.json(response);
    }

    // If no cache, fetch fresh data
    const playerId = await findPlayer(playerName);
    const playerData = await fetchPlayerData(playerId);

    // Process and return the data
    const response = await processAndCachePlayerData(playerData, playerName, region);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching player data:', error);
    // Ensure error response is properly formatted as JSON
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'An error occurred while fetching player data',
        cacheStatus: {
          isStale: false,
          isUpdating: false
        }
      },
      { status: error instanceof Error && error.message === "Player not found" ? 404 : 500 }
    );
  }
}
