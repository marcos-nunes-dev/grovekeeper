import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendHistoryUpdate } from './updates/route'

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
const DEEP_SEARCH_MAX_PAGES = 500
const DELAY_BETWEEN_REQUESTS = 300

async function fetchEvents(playerName: string, skip: number): Promise<MurderLedgerResponse> {
  const url = `https://murderledger.albiononline2d.com/api/players/${playerName}/events?skip=${skip}`
  const response = await fetch(url)
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  
  return response.json()
}

async function fetchAllEvents(playerName: string, isDeepSearch: boolean = false): Promise<MurderLedgerEvent[]> {
  let allEvents: MurderLedgerEvent[] = []
  let page = 0
  const maxPages = isDeepSearch ? DEEP_SEARCH_MAX_PAGES : MAX_PAGES
  
  while (page < maxPages) {
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
  const { searchParams } = new URL(request.url)
  const currentGuild = searchParams.get("currentGuild") || ""
  const isDeepSearch = searchParams.get("deep") === "true"
  
  try {
    // Check player cache for deep search status first
    const playerCache = await prisma.playerCache.findUnique({
      where: { playerName: playerName.toLowerCase() },
    })

    // For deep search, first check if it's already been done
    if (isDeepSearch) {
      if (playerCache?.hasDeepSearch) {
        return NextResponse.json({
          data: [],
          error: "Historical data has already been fetched for this player",
          cacheStatus: {
            isStale: false,
            isUpdating: false
          }
        })
      }

      const events = await fetchAllEvents(playerName, true)
      
      if (!events.length) {
        return NextResponse.json({
          data: [],
          cacheStatus: {
            isStale: false,
            isUpdating: false
          }
        })
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
        playerName: playerName.toLowerCase(),
        guildName,
        eventDate
      }))

      if (guildEntries.length > 0) {
        await prisma.guildHistory.createMany({
          data: guildEntries,
          skipDuplicates: true
        })
      }

      // Mark that deep search has been performed
      if (playerCache) {
        await prisma.playerCache.update({
          where: { playerName: playerName.toLowerCase() },
          data: { hasDeepSearch: true }
        })
      } else {
        await prisma.playerCache.create({
          data: {
            playerName: playerName.toLowerCase(),
            hasDeepSearch: true,
            killFame: BigInt(0),
            deathFame: BigInt(0),
            pveTotal: BigInt(0)
          }
        })
      }

      const formattedEntries = guildEntries.map(entry => ({
        name: entry.guildName,
        seenAt: entry.eventDate.toLocaleDateString()
      }))

      return NextResponse.json({
        data: formattedEntries,
        cacheStatus: {
          isStale: false,
          isUpdating: false
        },
        hasDeepSearched: true
      })
    }

    // Regular flow for non-deep searches
    // Check existing history first
    const existingHistory = await prisma.guildHistory.findMany({
      where: { playerName: playerName.toLowerCase() },
      orderBy: { eventDate: 'desc' },
      distinct: ['guildName'],
      select: {
        guildName: true,
        eventDate: true
      }
    })

    // If we have existing data
    if (existingHistory.length > 0) {
      const formattedHistory = existingHistory.map(entry => ({
        name: entry.guildName,
        seenAt: entry.eventDate.toLocaleDateString()
      }))

      // If current guild matches the most recent one, skip background update
      if (currentGuild && existingHistory[0].guildName === currentGuild) {
        return NextResponse.json({
          data: formattedHistory,
          cacheStatus: {
            isStale: false,
            isUpdating: false
          },
          hasDeepSearched: playerCache?.hasDeepSearch || false
        })
      }

      // Start background update
      fetchAndUpdateHistory(playerName, existingHistory[0].guildName)
        .then(async (newEntries) => {
          if (newEntries && newEntries.length > 0) {
            // Send updated data via SSE
            sendHistoryUpdate(playerName, {
              data: newEntries.map(entry => ({
                name: entry.guildName,
                seenAt: entry.eventDate.toLocaleDateString()
              })),
              cacheStatus: {
                isStale: false,
                isUpdating: false
              },
              hasDeepSearched: playerCache?.hasDeepSearch || false
            })
          } else {
            // Send cache status update
            sendHistoryUpdate(playerName, {
              data: formattedHistory,
              cacheStatus: {
                isStale: false,
                isUpdating: false
              },
              hasDeepSearched: playerCache?.hasDeepSearch || false
            })
          }
        })
        .catch((error) => {
          console.error('Background update failed:', error)
          sendHistoryUpdate(playerName, {
            data: formattedHistory,
            cacheStatus: {
              isStale: true,
              isUpdating: false
            },
            hasDeepSearched: playerCache?.hasDeepSearch || false
          })
        })

      // Return existing data immediately
      return NextResponse.json({
        data: formattedHistory,
        cacheStatus: {
          isStale: false,
          isUpdating: true
        },
        hasDeepSearched: playerCache?.hasDeepSearch || false
      })
    }

    // If no existing data, fetch fresh data
    const events = await fetchAllEvents(playerName)
    
    if (!events.length) {
      return NextResponse.json({
        data: [],
        cacheStatus: {
          isStale: false,
          isUpdating: false
        }
      })
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
      playerName: playerName.toLowerCase(),
      guildName,
      eventDate
    }))

    if (guildEntries.length > 0) {
      await prisma.guildHistory.createMany({
        data: guildEntries,
        skipDuplicates: true
      })
    }

    const formattedEntries = guildEntries.map(entry => ({
      name: entry.guildName,
      seenAt: entry.eventDate.toLocaleDateString()
    }))

    return NextResponse.json({
      data: formattedEntries,
      cacheStatus: {
        isStale: false,
        isUpdating: false
      }
    })

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

// Background update function
async function fetchAndUpdateHistory(playerName: string, lastKnownGuild: string) {
  try {
    const events = await fetchAllEvents(playerName)
    if (!events.length) return null

    const guildMap = new Map<string, Date>()
    let foundLastKnown = false
    
    // Process events until we find the last known guild
    for (const event of events) {
      const timestamp = new Date(event.time * 1000)
      let guild: string | null = null

      if (event.killer.name.toLowerCase() === playerName.toLowerCase()) {
        guild = event.killer.guild_name
      } else if (event.victim.name.toLowerCase() === playerName.toLowerCase()) {
        guild = event.victim.guild_name
      }

      if (guild) {
        // If we find the last known guild, we can stop processing
        if (guild === lastKnownGuild) {
          foundLastKnown = true
          break
        }

        const currentTimestamp = guildMap.get(guild)
        if (!currentTimestamp || timestamp > currentTimestamp) {
          guildMap.set(guild, timestamp)
        }
      }
    }

    // Only update if we found new guilds
    if (guildMap.size > 0 && foundLastKnown) {
      const newEntries = Array.from(guildMap.entries()).map(([guildName, eventDate]) => ({
        playerName,
        guildName,
        eventDate
      }))

      await prisma.guildHistory.createMany({
        data: newEntries,
        skipDuplicates: true
      })

      return newEntries
    }

    return null
  } catch (error) {
    console.error('Error in background update:', error)
    throw error
  }
} 