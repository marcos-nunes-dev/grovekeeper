import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const TIMEOUT = process.env.VERCEL ? 14000 : 60000 // 14s for Vercel Pro, 60s for local

export async function GET(request: Request) {
  let timeout: NodeJS.Timeout | undefined;
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      )
    }

    const controller = new AbortController();
    timeout = setTimeout(() => controller.abort(), TIMEOUT);

    try {
      const response = await fetch(
        `https://gameinfo.albiononline.com/api/gameinfo/search?q=${encodeURIComponent(query)}`,
        { 
          cache: 'no-store',
          signal: controller.signal
        }
      )

      clearTimeout(timeout);

      if (!response.ok) {
        if (response.status === 504) {
          return NextResponse.json(
            { error: 'The request timed out. The Albion API is experiencing high latency. Please try again.' },
            { status: 504 }
          )
        }
        return NextResponse.json(
          { error: 'Failed to fetch guild data' },
          { status: response.status }
        )
      }

      const data = await response.json()
      const result = {
        guilds: data.guilds,
        ...(process.env.VERCEL && {
          warning: 'This API has a 15-second timeout limit on Vercel deployment. For complex searches that might take longer, try breaking down your search into more specific terms.'
        })
      }
      return NextResponse.json(result)
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timed out while searching guilds' },
          { status: 504 }
        )
      }
      throw error; // Re-throw to be caught by outer catch
    } finally {
      clearTimeout(timeout);
    }
  } catch (error) {
    console.error('Error searching guilds:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 