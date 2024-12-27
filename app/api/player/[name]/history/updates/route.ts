import { getOrCreateStream } from './history-service'

export async function GET(
  request: Request,
  { params }: { params: { name: string } }
) {
  const playerName = params.name
  const stream = getOrCreateStream(playerName, request)

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  })
} 