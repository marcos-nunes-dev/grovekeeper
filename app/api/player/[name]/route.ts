import { NextResponse } from 'next/server'

interface AlbionPlayer {
  Id: string
  Name: string
}

interface SearchResponse {
  players: AlbionPlayer[]
}

const REGION_SERVERS = {
  west: 'https://gameinfo.albiononline.com',
  east: 'https://gameinfo-sgp.albiononline.com',
  europe: 'https://gameinfo-ams.albiononline.com'
} as const

export async function GET(
  request: Request,
  { params }: { params: { name: string } }
) {
  try {
    const playerName = params.name
    const { searchParams } = new URL(request.url)
    const region = searchParams.get('region') || 'west'

    if (!REGION_SERVERS[region as keyof typeof REGION_SERVERS]) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid region' }),
        { status: 400 }
      )
    }

    const baseUrl = REGION_SERVERS[region as keyof typeof REGION_SERVERS]

    console.log(baseUrl, region)

    // Fetch player data from Albion Online API
    const response = await fetch(`${baseUrl}/api/gameinfo/search?q=${encodeURIComponent(playerName)}`)
    
    if (!response.ok) {
      return new NextResponse(
        JSON.stringify({ error: 'Failed to fetch player data' }),
        { status: response.status }
      )
    }

    const searchData = await response.json() as SearchResponse
    const player = searchData.players?.find((p) => 
      p.Name.toLowerCase() === playerName.toLowerCase()
    )

    if (!player) {
      return new NextResponse(
        JSON.stringify({ error: 'Player not found' }),
        { status: 404 }
      )
    }

    // Fetch detailed player info
    const detailResponse = await fetch(`${baseUrl}/api/gameinfo/players/${player.Id}`)
    
    if (!detailResponse.ok) {
      return new NextResponse(
        JSON.stringify({ error: 'Failed to fetch player details' }),
        { status: detailResponse.status }
      )
    }

    const playerData = await detailResponse.json()

    // Format the response
    const formattedData = {
      id: playerData.Id,
      name: playerData.Name,
      guildName: playerData.GuildName,
      allianceName: playerData.AllianceName,
      allianceTag: playerData.AllianceTag,
      avatar: `https://render.albiononline.com/v1/player/${playerData.Name}/avatar?quality=0`,
      killFame: playerData.KillFame,
      deathFame: playerData.DeathFame,
      pveTotal: playerData.LifetimeStatistics?.PvE?.Total || 0,
      gatheringTotal: playerData.LifetimeStatistics?.Gathering?.All?.Total || 0,
      craftingTotal: playerData.LifetimeStatistics?.Crafting?.Total || 0,
      region
    }

    return NextResponse.json(formattedData)
  } catch (error: unknown) {
    console.error('Error fetching player data:', error)
    return new NextResponse(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500 }
    )
  }
} 