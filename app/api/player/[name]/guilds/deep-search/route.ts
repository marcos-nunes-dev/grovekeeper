import { NextResponse } from 'next/server';
import { withPrisma } from '@/lib/prisma-helper';
import { formatDistanceToNowStrict, format } from 'date-fns';
import { MurderLedgerEvent } from '@/types/albion';

const MURDER_LEDGER_API = 'https://murderledger.albiononline2d.com/api/players';
const DAYS_PER_BATCH = 15;
const MAX_BATCHES = 24; // This will search up to 360 days back
const RATE_LIMIT_DELAY = 100; // ms between requests

async function fetchMurderLedgerEvents(playerName: string, skip: number = 0): Promise<MurderLedgerEvent[]> {
  const url = `${MURDER_LEDGER_API}/${playerName}/events?skip=${skip}`;
  const response = await fetch(url);
  
  if (response.status === 429) {
    // Rate limited - wait longer and retry
    await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY * 5));
    return fetchMurderLedgerEvents(playerName, skip);
  }
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  return data.events || [];
}

export async function GET(
  request: Request,
  { params }: { params: { name: string } }
) {
  const playerName = params.name.toLowerCase();

  try {
    // Check if deep search is already in progress for this player
    const existingSearch = await withPrisma(prisma =>
      prisma.playerCache.findUnique({
        where: { playerName },
        select: { hasDeepSearch: true }
      })
    );

    if (existingSearch?.hasDeepSearch) {
      return NextResponse.json(
        { error: 'Deep search already completed for this player' },
        { status: 400 }
      );
    }

    // First, get recent events to calculate activity rate
    const recentEvents = await withPrisma(prisma =>
      prisma.playerEvent.findMany({
        where: { playerName },
        orderBy: { timestamp: 'desc' },
        take: 100 // Get last 100 events to calculate average
      })
    );

    if (recentEvents.length < 2) {
      return NextResponse.json(
        { error: 'Not enough events to calculate activity rate' },
        { status: 400 }
      );
    }

    // Calculate average events per day
    const firstEvent = recentEvents[recentEvents.length - 1];
    const lastEvent = recentEvents[0];
    const daysDiff = Math.max(1, (lastEvent.timestamp.getTime() - firstEvent.timestamp.getTime()) / (1000 * 60 * 60 * 24));
    const eventsPerDay = recentEvents.length / daysDiff;

    // Calculate how many events to skip for each batch (15 days worth of events)
    const eventsPerBatch = Math.ceil(eventsPerDay * DAYS_PER_BATCH);

    // Initialize guild map with existing guild history
    const existingGuildHistory = await withPrisma(prisma =>
      prisma.guildHistory.findMany({
        where: { playerName }
      })
    );

    const guildMap = new Map<string, { 
      firstSeen: Date, 
      lastSeen: Date, 
      name: string 
    }>();

    // Initialize map with existing guild history
    existingGuildHistory.forEach(guild => {
      guildMap.set(guild.guildName, {
        firstSeen: guild.firstSeen,
        lastSeen: guild.lastSeen,
        name: guild.guildName
      });
    });

    // Fetch events in batches
    let currentSkip = eventsPerBatch;
    let batchCount = 0;
    let foundNewGuild = false;

    do {
      const events = await fetchMurderLedgerEvents(playerName, currentSkip);
      if (events.length === 0) break;

      // Process events
      events.forEach(event => {
        const timestamp = new Date(event.time * 1000);
        let guildName = null;

        if (event.killer.name.toLowerCase() === playerName) {
          guildName = event.killer.guild_name;
        } else if (event.victim.name.toLowerCase() === playerName) {
          guildName = event.victim.guild_name;
        }

        if (guildName) {
          const existing = guildMap.get(guildName);
          if (existing) {
            if (timestamp < existing.firstSeen) {
              existing.firstSeen = timestamp;
              foundNewGuild = true;
            }
            if (timestamp > existing.lastSeen) {
              existing.lastSeen = timestamp;
              foundNewGuild = true;
            }
          } else {
            guildMap.set(guildName, {
              firstSeen: timestamp,
              lastSeen: timestamp,
              name: guildName
            });
            foundNewGuild = true;
          }
        }
      });

      // If we found a new guild, reset the batch counter to keep searching
      if (foundNewGuild) {
        batchCount = 0;
        foundNewGuild = false;
      } else {
        batchCount++;
      }

      currentSkip += eventsPerBatch;

      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    } while (batchCount < MAX_BATCHES);

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
            firstSeen: data.firstSeen,
            lastSeen: data.lastSeen
          }
        });
      }
    });

    // Convert to array and format dates for response
    const guildHistory = Array.from(guildMap.values())
      .sort((a, b) => b.lastSeen.getTime() - a.lastSeen.getTime())
      .map((guild, index) => ({
        id: `${guild.name}-${index}`,
        name: guild.name,
        joinDate: format(guild.firstSeen, 'MMM d, yyyy'),
        leaveDate: format(guild.lastSeen, 'MMM d, yyyy'),
        duration: formatDistanceToNowStrict(guild.firstSeen)
      }));

    // Update player cache to indicate deep search is complete
    await withPrisma(async (prisma) => {
      await prisma.playerCache.update({
        where: { playerName },
        data: { hasDeepSearch: true }
      });
    });

    return NextResponse.json(guildHistory);
  } catch (error) {
    console.error('Error in deep search:', error);
    
    // Return a more specific error message
    const errorMessage = error instanceof Error ? error.message : 'Failed to perform deep search';
    return NextResponse.json(
      { error: errorMessage },
      { status: error instanceof Error && error.message.includes('429') ? 429 : 500 }
    );
  }
} 