import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Try to search for a known guild to check if the API is working
    const response = await fetch(
      'https://gameinfo.albiononline.com/api/gameinfo/search?q=test',
      { cache: 'no-store' }
    )

    if (!response.ok) {
      return NextResponse.json(
        { status: 'error', message: 'API is not responding' },
        { status: 503 }
      )
    }

    return NextResponse.json({ status: 'ok' })
  } catch {
    return NextResponse.json(
      { status: 'error', message: 'API is not accessible' },
      { status: 503 }
    )
  }
} 