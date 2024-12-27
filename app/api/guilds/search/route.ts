import { NextResponse } from 'next/server'

interface GuildSearchResult {
  Id: string
  Name: string
  AllianceId: string
  AllianceName: string
  KillFame: number | null
  DeathFame: number
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      )
    }

    const response = await fetch(
      `https://gameinfo.albiononline.com/api/gameinfo/search?q=${encodeURIComponent(query)}`,
      { cache: 'no-store' }
    )

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch guild data' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data.guilds)
  } catch (error) {
    console.error('Error searching guilds:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 