import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const killId = params.id
    if (!killId || isNaN(Number(killId))) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid killboard ID format' }),
        { status: 400 }
      )
    }

    const response = await fetch(`https://gameinfo.albiononline.com/api/gameinfo/events/${killId}`)
    
    if (!response.ok) {
      if (response.status === 404) {
        return new NextResponse(
          JSON.stringify({ error: 'Killboard not found' }),
          { status: 404 }
        )
      }
      return new NextResponse(
        JSON.stringify({ 
          error: 'Failed to fetch killboard data',
          details: `Albion API returned status ${response.status}`
        }),
        { status: response.status }
      )
    }

    const data = await response.json()
    if (!data || !data.Victim) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid killboard data format' }),
        { status: 422 }
      )
    }

    return NextResponse.json(data)
  } catch (error: unknown) {
    console.error('Error fetching killboard data:', error)
    return new NextResponse(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500 }
    )
  }
} 