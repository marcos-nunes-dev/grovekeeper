import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const killId = params.id
    const response = await fetch(`https://gameinfo.albiononline.com/api/gameinfo/events/${killId}`)
    
    if (!response.ok) {
      return new NextResponse(
        JSON.stringify({ error: 'Failed to fetch killboard data' }),
        { status: response.status }
      )
    }

    const data = await response.json()
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