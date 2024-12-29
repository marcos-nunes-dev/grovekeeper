import { NextResponse } from 'next/server'
import { getOrCreateClientHandlers, removeClientHandler, type SSEResponse } from '@/lib/updates'
import { prismaSSE } from '@/lib/prisma-sse'

export async function GET(
  request: Request,
  { params }: { params: { name: string } }
) {
  const playerName = params.name.toLowerCase()
  
  // Set up SSE
  const stream = new TransformStream()
  const writer = stream.writable.getWriter()
  const encoder = new TextEncoder()

  const handlers = getOrCreateClientHandlers(playerName)
  const handler = (data: SSEResponse) => {
    const message = `data: ${JSON.stringify(data)}\n\n`
    writer.write(encoder.encode(message)).catch(console.error)
  }
  handlers.add(handler)

  // Remove handler and clean up when client disconnects
  request.signal.addEventListener('abort', async () => {
    removeClientHandler(playerName, handler)
    
    // If this was the last handler for this player, clean up any ongoing operations
    const remainingHandlers = getOrCreateClientHandlers(playerName)
    if (remainingHandlers.size === 0) {
      try {
        // Any cleanup specific to this player's SSE connection
        // For example, canceling any ongoing background tasks
        console.log(`Cleaning up SSE connection for player: ${playerName}`)
      } catch (error) {
        console.error('Error during SSE cleanup:', error)
      }
    }
  })

  return new NextResponse(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  })
} 