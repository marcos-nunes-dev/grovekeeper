import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendUpdate } from "./updates/route";

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

const ALBION_API = "https://gameinfo.albiononline.com/api/gameinfo";

async function findPlayer(playerName: string): Promise<string> {
  // Always search in Albion API first to get the latest player ID
  const searchUrl = `${ALBION_API}/search?q=${encodeURIComponent(playerName)}`;
  const response = await fetch(searchUrl);

  if (!response.ok) {
    throw new Error(`Search failed: ${response.status}`);
  }

  const data = (await response.json()) as AlbionSearchResponse;
  const player = data.players?.find(
    (p) => p.Name.toLowerCase() === playerName.toLowerCase()
  );

  if (!player) {
    throw new Error("Player not found");
  }

  // Update the cache with the correct player ID
  const cachedPlayer = await prisma.playerCache.findUnique({
    where: { playerName: playerName.toLowerCase() },
  });

  if (cachedPlayer && cachedPlayer.id !== player.Id) {
    // If the cached ID is different, update it
    await prisma.playerCache.update({
      where: { playerName: playerName.toLowerCase() },
      data: { id: player.Id },
    });
  }

  return player.Id;
}

async function fetchPlayerDetails(
  playerId: string
): Promise<AlbionPlayerResponse> {
  const detailsUrl = `${ALBION_API}/players/${playerId}`;
  const response = await fetch(detailsUrl);

  if (!response.ok) {
    throw new Error(`Failed to fetch player details: ${response.status}`);
  }

  return response.json();
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
    return await prisma.playerCache.findUnique({
      where: { playerName: playerName.toLowerCase() },
    });
  } catch (error) {
    console.error("Failed to get cached player:", error);
    return null;
  }
}

async function updatePlayerCache(data: AlbionPlayerResponse) {
  try {
    await prisma.playerCache.upsert({
      where: {
        playerName: data.Name.toLowerCase(),
      },
      create: {
        id: data.Id,
        playerName: data.Name.toLowerCase(),
        guildName: data.GuildName,
        killFame: BigInt(Math.floor(data.KillFame)),
        deathFame: BigInt(Math.floor(data.DeathFame)),
        pveTotal: BigInt(Math.floor(data.LifetimeStatistics?.PvE?.Total || 0)),
        gatheringTotal: BigInt(Math.floor(data.LifetimeStatistics?.Gathering?.All?.Total || 0)),
        craftingTotal: BigInt(Math.floor(data.LifetimeStatistics?.Crafting?.Total || 0)),
        hasDeepSearch: false
      },
      update: {
        id: data.Id,
        guildName: data.GuildName,
        killFame: BigInt(Math.floor(data.KillFame)),
        deathFame: BigInt(Math.floor(data.DeathFame)),
        pveTotal: BigInt(Math.floor(data.LifetimeStatistics?.PvE?.Total || 0)),
        gatheringTotal: BigInt(Math.floor(data.LifetimeStatistics?.Gathering?.All?.Total || 0)),
        craftingTotal: BigInt(Math.floor(data.LifetimeStatistics?.Crafting?.Total || 0)),
        updatedAt: new Date(),
      },
    });
    return true;
  } catch (error) {
    console.error("Failed to update player cache:", error);
    return null;
  }
}

// Helper function to fetch fresh data from Albion API
async function fetchFreshData(playerName: string, region: string) {
  const playerId = await findPlayer(playerName);
  const playerData = await fetchPlayerDetails(playerId);
  const formattedData = await formatPlayerData(playerData, region);
  return { playerData, formattedData };
}

type FreshDataResult = {
  playerData: AlbionPlayerResponse;
  formattedData: ReturnType<typeof formatPlayerData>;
};

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

      // Start background update only if cache is stale
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

    // No cache, fetch fresh data
    try {
      const { playerData, formattedData } = await fetchFreshData(
        playerName,
        region
      );

      // Save to cache
      await updatePlayerCache(playerData);

      // Return fresh data
      return NextResponse.json({
        data: formattedData,
        cacheStatus: {
          isStale: false,
          isUpdating: false,
        },
      });
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Failed to fetch fresh data"
      );
    }
  } catch (error) {
    console.error("Error fetching player data:", error);
    const status =
      error instanceof Error && error.message === "Player not found"
        ? 404
        : 500;
    const message = error instanceof Error ? error.message : "Unknown error";

    return new NextResponse(
      JSON.stringify({
        error: "Failed to fetch player data",
        details: message,
      }),
      { status }
    );
  }
}
