import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const response = await fetch(
      `https://gameinfo.albiononline.com/api/gameinfo/guilds/${params.id}`,
      { cache: 'no-store' }
    )

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch guild data' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching guild details:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 