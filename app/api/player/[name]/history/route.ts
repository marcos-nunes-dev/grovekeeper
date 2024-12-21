import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface MurderLedgerEvent {
  time: number
  killer: {
    name: string
    guild_name: string | null
  }
  victim: {
    name: string
    guild_name: string | null
  }
}

interface MurderLedgerResponse {
  events: MurderLedgerEvent[]
  skip: number
  take: number
}

const EVENTS_PER_PAGE = 20
const MAX_PAGES = 50
const DELAY_BETWEEN_REQUESTS = 300

async function fetchEvents(playerName: string, skip: number): Promise<MurderLedgerResponse> {
  const url = `https://murderledger.albiononline2d.com/api/players/${playerName}/events?skip=${skip}`
  const response = await fetch(url)
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  
  return response.json()
}

async function fetchAllEvents(playerName: string): Promise<MurderLedgerEvent[]> {
  let allEvents: MurderLedgerEvent[] = []
  let page = 0
  
  while (page < MAX_PAGES) {
    const skip = page * EVENTS_PER_PAGE
    
    try {
      const data = await fetchEvents(playerName, skip)
      
      if (!data.events?.length) break
      
      allEvents = allEvents.concat(data.events)
      
      if (data.events.length < EVENTS_PER_PAGE) break
      
      page++
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS))
    } catch (error) {
      console.error(`Error fetching page ${page}:`, error)
      break
    }
  }
  
  return allEvents
}

export async function GET(
  request: Request,
  { params }: { params: { name: string } }
) {
  const playerName = params.name
  
  try {
    // Check existing history first
    const existingHistory = await prisma.guildHistory.findMany({
      where: { playerName },
      orderBy: { eventDate: 'desc' },
      distinct: ['guildName'],
      select: {
        guildName: true,
        eventDate: true
      }
    })

    if (existingHistory.length > 0) {
      return NextResponse.json(
        existingHistory.map(entry => ({
          name: entry.guildName,
          seenAt: entry.eventDate.toLocaleDateString()
        }))
      )
    }

    // Fetch and process new history
    const events = await fetchAllEvents(playerName)
    
    if (!events.length) {
      return NextResponse.json([])
    }

    // Extract unique guilds with latest timestamps
    const guildMap = new Map<string, Date>()
    
    events.forEach(event => {
      const timestamp = new Date(event.time * 1000)
      let guild: string | null = null

      if (event.killer.name.toLowerCase() === playerName.toLowerCase()) {
        guild = event.killer.guild_name
      } else if (event.victim.name.toLowerCase() === playerName.toLowerCase()) {
        guild = event.victim.guild_name
      }

      if (guild) {
        const currentTimestamp = guildMap.get(guild)
        if (!currentTimestamp || timestamp > currentTimestamp) {
          guildMap.set(guild, timestamp)
        }
      }
    })

    // Save to database
    const guildEntries = Array.from(guildMap.entries()).map(([guildName, eventDate]) => ({
      playerName,
      guildName,
      eventDate
    }))

    if (guildEntries.length > 0) {
      await prisma.guildHistory.createMany({
        data: guildEntries,
        skipDuplicates: true
      })
    }

    return NextResponse.json(
      guildEntries.map(entry => ({
        name: entry.guildName,
        seenAt: entry.eventDate.toLocaleDateString()
      }))
    )

  } catch (error) {
    console.error('Error in guild history:', error)
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to fetch guild history',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500 }
    )
  }
} 