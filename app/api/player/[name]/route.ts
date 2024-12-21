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
      where: { playerName },
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
        playerName: data.Name,
      },
      create: {
        playerName: data.Name,
        guildName: data.GuildName,
        killFame: BigInt(Math.floor(data.KillFame)),
        deathFame: BigInt(Math.floor(data.DeathFame)),
        pveTotal: BigInt(Math.floor(data.LifetimeStatistics?.PvE?.Total || 0)),
      },
      update: {
        guildName: data.GuildName,
        killFame: BigInt(Math.floor(data.KillFame)),
        deathFame: BigInt(Math.floor(data.DeathFame)),
        pveTotal: BigInt(Math.floor(data.LifetimeStatistics?.PvE?.Total || 0)),
        updatedAt: new Date(),
      },
    });
    return true;
  } catch (error) {
    console.error("Failed to update player cache:", error);
    return false;
  }
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
      // Return cached data immediately
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
          gatheringTotal: 0,
          craftingTotal: 0,
          region,
        },
        cacheStatus: {
          isStale: false,
          isUpdating: true,
        },
      };

      // Start background update
      fetchFreshData(playerName, region)
        .then(async ({ playerData, formattedData }) => {
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
          if (cachedPlayer) {
            sendUpdate(playerName, {
              data: response.data,
              cacheStatus: {
                isStale: true,
                isUpdating: false,
              },
            });
          } else {
            // Send error via SSE
            sendUpdate(playerName, {
              error: "Failed to update player data",
              details: error instanceof Error ? error.message : "Unknown error",
            });
          }
        });

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

// Helper function to fetch fresh data from Albion API
async function fetchFreshData(playerName: string, region: string) {
  const playerId = await findPlayer(playerName);
  const playerData = await fetchPlayerDetails(playerId);
  const formattedData = await formatPlayerData(playerData, region);
  return { playerData, formattedData };
}
