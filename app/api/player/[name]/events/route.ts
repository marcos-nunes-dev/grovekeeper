import { NextResponse } from 'next/server'
import { withPrisma } from '@/lib/prisma-helper'
import { PrismaClient, Prisma } from '@prisma/client'
import { sendUpdate } from '../updates/route'

const EVENTS_PER_PAGE = 20
const MURDER_LEDGER_API = 'https://murderledger.albiononline2d.com/api/players'
const ALBION_API = "https://gameinfo.albiononline.com/api/gameinfo"

interface AlbionSearchResponse {
  players: Array<{
    Id: string
    Name: string
  }>
}

async function findPlayer(playerName: string): Promise<string> {
  const searchUrl = `${ALBION_API}/search?q=${encodeURIComponent(playerName)}`
  const response = await fetch(searchUrl)

  if (!response.ok) {
    throw new Error(`Search failed: ${response.status}`)
  }

  const data = (await response.json()) as AlbionSearchResponse
  const player = data.players?.find(
    (p) => p.Name.toLowerCase() === playerName.toLowerCase()
  )

  if (!player) {
    throw new Error("Player not found")
  }

  return player.Id
}

interface MurderLedgerEvent {
  id: number
  time: number
  battle_id: number
  killer: {
    name: string
    item_power: number
    guild_name: string | null
    alliance_name: string | null
    loadout: {
      main_hand?: {
        id: string
        type: string
        tier: number
        enchant: number
        quality: number
        en_name: string
      }
      off_hand?: {
        id: string
        type: string
        tier: number
        enchant: number
        quality: number
        en_name: string
      }
      head?: {
        id: string
        type: string
        tier: number
        enchant: number
        quality: number
        en_name: string
      }
      body?: {
        id: string
        type: string
        tier: number
        enchant: number
        quality: number
        en_name: string
      }
      shoe?: {
        id: string
        type: string
        tier: number
        enchant: number
        quality: number
        en_name: string
      }
      bag?: {
        id: string
        type: string
        tier: number
        enchant: number
        quality: number
        en_name: string
      }
      cape?: {
        id: string
        type: string
        tier: number
        enchant: number
        quality: number
        en_name: string
      }
      mount?: {
        id: string
        type: string
        tier: number
        enchant: number
        quality: number
        en_name: string
      }
      food?: {
        id: string
        type: string
        tier: number
        enchant: number
        quality: number
        en_name: string
      }
      potion?: {
        id: string
        type: string
        tier: number
        enchant: number
        quality: number
        en_name: string
      }
    }
    vod: string
    is_primary: boolean
    kill_fame: number
    damage_done: number
    healing_done: number
  }
  victim: {
    name: string
    item_power: number
    guild_name: string | null
    alliance_name: string | null
    loadout: {
      main_hand?: {
        id: string
        type: string
        tier: number
        enchant: number
        quality: number
        en_name: string
      }
      off_hand?: {
        id: string
        type: string
        tier: number
        enchant: number
        quality: number
        en_name: string
      }
      head?: {
        id: string
        type: string
        tier: number
        enchant: number
        quality: number
        en_name: string
      }
      body?: {
        id: string
        type: string
        tier: number
        enchant: number
        quality: number
        en_name: string
      }
      shoe?: {
        id: string
        type: string
        tier: number
        enchant: number
        quality: number
        en_name: string
      }
      bag?: {
        id: string
        type: string
        tier: number
        enchant: number
        quality: number
        en_name: string
      }
      cape?: {
        id: string
        type: string
        tier: number
        enchant: number
        quality: number
        en_name: string
      }
      mount?: {
        id: string
        type: string
        tier: number
        enchant: number
        quality: number
        en_name: string
      }
      food?: {
        id: string
        type: string
        tier: number
        enchant: number
        quality: number
        en_name: string
      }
      potion?: {
        id: string
        type: string
        tier: number
        enchant: number
        quality: number
        en_name: string
      }
    }
    vod: string
  }
  total_kill_fame: number
  participant_count: number
  party_size: number
  tags: {
    is_1v1: boolean
    is_2v2: boolean
    is_5v5: boolean
    is_zvz: boolean
    fair: boolean
    unfair: boolean
  }
}

interface StoredEvent {
  id: string
  playerId: string
  playerName: string
  timestamp: Date
  eventType: string
  eventData: any
  createdAt: Date
  updatedAt: Date
}

async function fetchMurderLedgerEvents(playerName: string, skip: number = 0): Promise<MurderLedgerEvent[]> {
  const url = `${MURDER_LEDGER_API}/${playerName}/events?skip=${skip}`
  const response = await fetch(url)
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  
  const data = await response.json()
  return data.events || []
}

async function getStoredEvents(playerName: string, limit: number): Promise<StoredEvent[]> {
  return withPrisma(prisma =>
    prisma.playerEvent.findMany({
      where: { playerName: playerName.toLowerCase() },
      orderBy: { timestamp: 'desc' },
      take: limit
    })
  )
}

async function getLatestStoredEvent(playerName: string): Promise<StoredEvent | null> {
  return withPrisma(prisma => 
    prisma.playerEvent.findFirst({
      where: { playerName: playerName.toLowerCase() },
      orderBy: { timestamp: 'desc' }
    })
  )
}

async function storeNewEvents(events: MurderLedgerEvent[], playerName: string) {
  if (events.length === 0) return

  // Get the player's ID from Albion API
  const playerId = await findPlayer(playerName)
  
  const eventsToCreate = events.map(event => ({
    id: event.id.toString(),
    playerId,
    playerName: playerName.toLowerCase(),
    timestamp: new Date(event.time * 1000),
    eventType: event.killer.name.toLowerCase() === playerName.toLowerCase() ? 'KILL' : 'DEATH',
    eventData: event as unknown as Prisma.InputJsonValue
  }))

  return withPrisma(prisma =>
    prisma.playerEvent.createMany({
      data: eventsToCreate,
      skipDuplicates: true
    })
  )
}

export async function GET(
  request: Request,
  { params }: { params: { name: string } }
) {
  const playerName = params.name;
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '50');
  
  try {
    // 1. First get events from our database
    const storedEvents = await getStoredEvents(playerName, limit);

    // For first-time users with no stored events, just fetch first page from Murder Ledger
    if (storedEvents.length === 0) {
      const events = await fetchMurderLedgerEvents(playerName, 0);
      if (events.length > 0) {
        await storeNewEvents(events, playerName);
        const initialEvents = await getStoredEvents(playerName, limit);
        return NextResponse.json({
          data: initialEvents.map(event => event.eventData),
          newEventsCount: events.length,
          totalEvents: initialEvents.length,
          isCheckingNewEvents: false
        });
      }
      return NextResponse.json({
        data: [],
        newEventsCount: 0,
        totalEvents: 0,
        isCheckingNewEvents: false
      });
    }

    // For existing users, return stored data immediately
    const immediateResponse = NextResponse.json({
      data: storedEvents.map(event => event.eventData),
      newEventsCount: 0,
      totalEvents: storedEvents.length,
      isCheckingNewEvents: true // Indicate we're checking for updates
    });

    // Then check for newer events in the background
    const checkNewEvents = async () => {
      console.log('Starting background check for new events');
      const latestEvent = storedEvents[0];
      let newEvents: MurderLedgerEvent[] = [];
      let skip = 0;
      let foundExisting = false;

      while (!foundExisting) {
        try {
          const events = await fetchMurderLedgerEvents(playerName, skip);
          console.log(`Fetched ${events.length} events from Murder Ledger`);
          
          if (events.length === 0) {
            console.log('No more events to fetch');
            break;
          }

          const existingEventIndex = events.findIndex(
            event => event.id.toString() === latestEvent.id
          );

          if (existingEventIndex !== -1) {
            console.log('Found existing event at index:', existingEventIndex);
            newEvents = [...newEvents, ...events.slice(0, existingEventIndex)];
            foundExisting = true;
          } else {
            newEvents = [...newEvents, ...events];
          }

          skip += EVENTS_PER_PAGE;
          
          if (skip >= 100) {
            console.log('Reached maximum pages, stopping');
            foundExisting = true;
          }
        } catch (error) {
          console.error('Error fetching from Murder Ledger:', error);
          foundExisting = true;
        }
      }

      console.log(`Found ${newEvents.length} new events`);

      if (newEvents.length > 0) {
        await storeNewEvents(newEvents, playerName);
        const updatedEvents = await getStoredEvents(playerName, limit);
        
        // Send update via SSE
        console.log('Sending update with new events');
        sendUpdate(playerName, {
          data: updatedEvents.map(event => event.eventData),
          newEventsCount: newEvents.length,
          totalEvents: updatedEvents.length,
          isCheckingNewEvents: false // Ensure this is false when done
        });
      } else {
        // Send completion status even if no new events
        console.log('Sending completion status with no new events');
        sendUpdate(playerName, {
          data: storedEvents.map(event => event.eventData),
          newEventsCount: 0,
          totalEvents: storedEvents.length,
          isCheckingNewEvents: false // Ensure this is false when done
        });
      }
    };

    // Start background check without waiting for it
    checkNewEvents().catch(error => {
      console.error('Error in background check:', error);
      // Send error status via SSE
      console.log('Sending error status');
      sendUpdate(playerName, {
        data: storedEvents.map(event => event.eventData),
        newEventsCount: 0,
        totalEvents: storedEvents.length,
        isCheckingNewEvents: false, // Ensure this is false on error
        error: 'Failed to check for new events'
      });
    });

    return immediateResponse;

  } catch (error) {
    console.error('Error fetching player events:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch player events',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
