import { NextResponse } from 'next/server'
import { getOrCreateClientHandlers, removeClientHandler, type SSEResponse } from '@/lib/updates'

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

  // Remove handler when client disconnects
  request.signal.addEventListener('abort', () => {
    removeClientHandler(playerName, handler)
  })

  return new NextResponse(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  })
} 