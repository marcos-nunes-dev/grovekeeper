import { NextResponse } from 'next/server'
import { withPrisma } from '@/lib/prisma-helper'
import { PlayerEvent, Prisma } from '@prisma/client'

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
    group_members?: Array<{
      name: string
      damage_done: number
      healing_done: number
      kill_fame: number
    }>
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

async function fetchMurderLedgerEvents(playerName: string, skip: number = 0): Promise<MurderLedgerEvent[]> {
  const url = `${MURDER_LEDGER_API}/${playerName}/events?skip=${skip}`
  const response = await fetch(url)
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  
  const data = await response.json()
  return data.events || []
}

async function getStoredEvents(
  playerName: string,
  limit: number,
  skip: number
): Promise<PlayerEvent[]> {
  return await withPrisma(prisma =>
    prisma.playerEvent.findMany({
      where: { playerName: playerName.toLowerCase() },
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: skip
    })
  )
}

async function storeNewEvents(
  events: MurderLedgerEvent[],
  playerName: string
): Promise<void> {
  const playerId = await findPlayer(playerName)
  
  await withPrisma(async (prisma) => {
    // Process events sequentially
    for (const event of events) {
      const eventData = event as unknown as Prisma.InputJsonValue
      await prisma.playerEvent.upsert({
        where: {
          id: event.id.toString()
        },
        create: {
          id: event.id.toString(),
          playerId,
          playerName: playerName.toLowerCase(),
          timestamp: new Date(event.time * 1000),
          eventType: event.killer.name.toLowerCase() === playerName.toLowerCase() ? 'KILL' : 'DEATH',
          eventData
        },
        update: {
          timestamp: new Date(event.time * 1000),
          eventData
        }
      })
    }
  })
}

export async function GET(
  request: Request,
  { params }: { params: { name: string } }
) {
  const playerName = params.name.toLowerCase()
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '50')
  const skip = parseInt(searchParams.get('skip') || '0')

  try {
    // 1. First get events from our database
    const storedEvents = await getStoredEvents(playerName, limit, skip)

    // For first-time users with no stored events, fetch and store initial data
    if (storedEvents.length === 0 && skip === 0) {
      const events = await fetchMurderLedgerEvents(playerName, 0)
      if (events.length > 0) {
        await storeNewEvents(events, playerName)
        const initialEvents = await getStoredEvents(playerName, limit, skip)
        return NextResponse.json({
          data: initialEvents.map(event => event.eventData),
          newEventsCount: events.length,
          totalEvents: initialEvents.length,
          isCheckingNewEvents: false
        })
      }
      return NextResponse.json({
        data: [],
        newEventsCount: 0,
        totalEvents: 0,
        isCheckingNewEvents: false
      })
    }

    // Check for new events on initial load
    if (skip === 0 && storedEvents.length > 0) {
      const latestStoredEvent = storedEvents[0]
      const latestEvents = await fetchMurderLedgerEvents(playerName, 0)
      
      // Filter out events that are newer than our latest stored event
      const newEvents = latestEvents.filter(event => {
        const eventTime = new Date(event.time * 1000)
        return eventTime > latestStoredEvent.timestamp
      })

      if (newEvents.length > 0) {
        await storeNewEvents(newEvents, playerName)
        const updatedEvents = await getStoredEvents(playerName, limit, skip)
        return NextResponse.json({
          data: updatedEvents.map(event => event.eventData),
          newEventsCount: newEvents.length,
          totalEvents: updatedEvents.length,
          isCheckingNewEvents: false
        })
      }
    }

    // If we're loading more and don't have enough stored events
    if (storedEvents.length < limit) {
      // Get the total count of stored events before the current skip point
      const totalStoredBefore = await withPrisma(prisma =>
        prisma.playerEvent.count({
          where: { playerName: playerName.toLowerCase() }
        })
      )

      // Only fetch from Murder Ledger if we're near the end of our stored data
      if (skip >= totalStoredBefore - limit) {
        const murderLedgerSkip = Math.max(0, totalStoredBefore)
        const events = await fetchMurderLedgerEvents(playerName, murderLedgerSkip)
        
        if (events.length > 0) {
          // Store the new events
          await storeNewEvents(events, playerName)
          
          // Get the updated events for the current page
          const moreEvents = await getStoredEvents(playerName, limit, skip)
          return NextResponse.json({
            data: moreEvents.map(event => event.eventData),
            newEventsCount: events.length,
            totalEvents: totalStoredBefore + events.length,
            isCheckingNewEvents: false
          })
        }
      }
    }

    // Return stored data
    const totalEvents = await withPrisma(prisma =>
      prisma.playerEvent.count({
        where: { playerName: playerName.toLowerCase() }
      })
    )

    return NextResponse.json({
      data: storedEvents.map(event => event.eventData),
      newEventsCount: 0,
      totalEvents,
      isCheckingNewEvents: false
    })

  } catch (error) {
    console.error('Error in events endpoint:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}
