import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  let timeout: NodeJS.Timeout | undefined;
  try {
    const controller = new AbortController();
    timeout = setTimeout(() => controller.abort(), 60000); // 30 second timeout

    try {
      const response = await fetch(
        `https://gameinfo.albiononline.com/api/gameinfo/guilds/${params.id}`,
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
      return NextResponse.json(data)
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timed out while fetching guild details' },
          { status: 504 }
        )
      }
      throw error; // Re-throw to be caught by outer catch
    } finally {
      clearTimeout(timeout);
    }
  } catch (error) {
    console.error('Error fetching guild details:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 