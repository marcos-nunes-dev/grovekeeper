import { NextResponse } from 'next/server';
import { withPrisma } from '@/lib/prisma-helper';
import { formatDistanceToNowStrict, format } from 'date-fns';
import { MurderLedgerEvent } from '@/types/albion';

// Helper function to format guild history for response
const formatGuildHistory = (guilds: Array<{ name: string, firstSeen: Date, lastSeen: Date }>) => {
  return guilds
    .sort((a, b) => b.lastSeen.getTime() - a.lastSeen.getTime())
    .map((guild, index) => ({
      id: `${guild.name}-${index}`,
      name: guild.name,
      joinDate: format(guild.firstSeen, 'MMM d, yyyy'),
      leaveDate: format(guild.lastSeen, 'MMM d, yyyy'),
      duration: formatDistanceToNowStrict(guild.firstSeen)
    }));
};

// Background update function
async function updateGuildHistory(playerName: string) {
  // Get all events for the player to check for new guilds
  const events = await withPrisma(prisma =>
    prisma.playerEvent.findMany({
      where: { playerName },
      orderBy: { timestamp: 'desc' },
      select: {
        eventData: true,
        timestamp: true
      }
    })
  );

  // Extract unique guilds with their first and last appearance
  const guildMap = new Map<string, { 
    firstSeen: Date, 
    lastSeen: Date, 
    name: string 
  }>();

  // Process events to find new guilds or update existing ones
  events.forEach(event => {
    const data = event.eventData as unknown as MurderLedgerEvent;
    let guildName = null;

    if (data.killer.name.toLowerCase() === playerName) {
      guildName = data.killer.guild_name;
    } else if (data.victim.name.toLowerCase() === playerName) {
      guildName = data.victim.guild_name;
    }

    if (guildName) {
      const existing = guildMap.get(guildName);
      if (existing) {
        if (event.timestamp < existing.firstSeen) {
          existing.firstSeen = event.timestamp;
        }
        if (event.timestamp > existing.lastSeen) {
          existing.lastSeen = event.timestamp;
        }
      } else {
        guildMap.set(guildName, {
          firstSeen: event.timestamp,
          lastSeen: event.timestamp,
          name: guildName
        });
      }
    }
  });

  // Update guild history in database
  await withPrisma(async (prisma) => {
    const entries = Array.from(guildMap);
    for (const [guildName, data] of entries) {
      await prisma.guildHistory.upsert({
        where: {
          playerName_guildName: {
            playerName,
            guildName
          }
        },
        create: {
          playerName,
          guildName,
          firstSeen: data.firstSeen,
          lastSeen: data.lastSeen
        },
        update: {
          lastSeen: data.lastSeen,
          firstSeen: data.firstSeen
        }
      });
    }
  });

  // Return formatted guild history
  return formatGuildHistory(Array.from(guildMap.values()));
}

export async function GET(
  request: Request,
  { params }: { params: { name: string } }
) {
  const playerName = params.name.toLowerCase();

  try {
    // First, get existing guild history from the database
    const [guildHistory, playerCache] = await withPrisma(async (prisma) => {
      const [history, cache] = await Promise.all([
        prisma.guildHistory.findMany({
          where: { playerName },
          orderBy: { lastSeen: 'desc' }
        }),
        prisma.playerCache.findUnique({
          where: { playerName },
          select: { hasDeepSearch: true }
        })
      ]);
      return [history, cache];
    });

    // Format and return existing data immediately if available
    if (guildHistory.length > 0) {
      const initialResponse = formatGuildHistory(
        guildHistory.map(gh => ({
          name: gh.guildName,
          firstSeen: gh.firstSeen,
          lastSeen: gh.lastSeen
        }))
      );

      // Start background update
      updateGuildHistory(playerName).catch(console.error);

      return NextResponse.json({
        guilds: initialResponse,
        hasDeepSearch: playerCache?.hasDeepSearch ?? false
      });
    }

    // If no existing data, proceed with full update
    const updatedHistory = await updateGuildHistory(playerName);
    return NextResponse.json({
      guilds: updatedHistory,
      hasDeepSearch: playerCache?.hasDeepSearch ?? false
    });
  } catch (error) {
    console.error('Error fetching guild history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch guild history' },
      { status: 500 }
    );
  }
} 