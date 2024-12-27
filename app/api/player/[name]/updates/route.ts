import { NextResponse } from 'next/server'
import type { PlayerData } from '@/types/albion'

interface UpdateResponse {
  data: PlayerData
  cacheStatus: {
    isStale: boolean
    isUpdating: boolean
  }
}

interface ErrorResponse {
  error: string
  details?: string
}

type SSEResponse = UpdateResponse | ErrorResponse

const clients = new Map<string, Set<(data: SSEResponse) => void>>()

export function sendUpdate(playerName: string, data: SSEResponse) {
  const key = playerName.toLowerCase()
  const handlers = clients.get(key)
  if (handlers) {
    handlers.forEach(handler => handler(data))
  }
}

export async function GET(
  request: Request,
  { params }: { params: { name: string } }
) {
  const playerName = params.name.toLowerCase()
  
  // Set up SSE
  const stream = new TransformStream()
  const writer = stream.writable.getWriter()
  const encoder = new TextEncoder()

  // Add client to the map
  if (!clients.has(playerName)) {
    clients.set(playerName, new Set())
  }

  const handlers = clients.get(playerName)!
  const handler = (data: SSEResponse) => {
    const message = `data: ${JSON.stringify(data)}\n\n`
    writer.write(encoder.encode(message)).catch(console.error)
  }
  handlers.add(handler)

  // Clean up on disconnect
  request.signal.addEventListener('abort', () => {
    handlers.delete(handler)
    if (handlers.size === 0) {
      clients.delete(playerName)
    }
    writer.close().catch(console.error)
  })

  return new NextResponse(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
} 