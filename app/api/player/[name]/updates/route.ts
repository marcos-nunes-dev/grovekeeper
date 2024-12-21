// Global map to store SSE controllers with automatic cleanup after 5 minutes
export const updateControllers = new Map<string, {
  controller: ReadableStreamDefaultController;
  timeout: NodeJS.Timeout;
}>()

const STREAM_TIMEOUT = 5 * 60 * 1000 // 5 minutes

interface UpdateMessage {
  data?: {
    id: string;
    name: string;
    guildName: string;
    allianceName: string;
    allianceTag: string;
    avatar: string;
    killFame: number;
    deathFame: number;
    pveTotal: number;
    gatheringTotal: number;
    craftingTotal: number;
    region: string;
  };
  cacheStatus?: {
    isStale: boolean;
    isUpdating: boolean;
  };
  error?: string;
  details?: string;
}

export async function GET(
  request: Request,
  { params }: { params: { name: string } }
) {
  const playerName = params.name

  // Create SSE stream
  const stream = new ReadableStream({
    start(controller) {
      // Clear any existing controller for this player
      const existing = updateControllers.get(playerName)
      if (existing) {
        clearTimeout(existing.timeout)
        existing.controller.close()
      }

      // Set up automatic cleanup after timeout
      const timeout = setTimeout(() => {
        const entry = updateControllers.get(playerName)
        if (entry) {
          entry.controller.close()
          updateControllers.delete(playerName)
        }
      }, STREAM_TIMEOUT)

      // Store the new controller with its timeout
      updateControllers.set(playerName, {
        controller,
        timeout
      })

      // Clean up when client disconnects
      request.signal.addEventListener('abort', () => {
        const entry = updateControllers.get(playerName)
        if (entry) {
          clearTimeout(entry.timeout)
          entry.controller.close()
          updateControllers.delete(playerName)
        }
      })
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  })
}

// Helper function to send updates
export async function sendUpdate(playerName: string, message: UpdateMessage) {
  const entry = updateControllers.get(playerName)
  if (entry) {
    try {
      const encoder = new TextEncoder()
      const messageText = encoder.encode(`data: ${JSON.stringify(message)}\n\n`)
      entry.controller.enqueue(messageText)
    } catch (error) {
      console.error(`Error sending update for ${playerName}:`, error)
      // Clean up the connection if we can't send updates
      clearTimeout(entry.timeout)
      entry.controller.close()
      updateControllers.delete(playerName)
    }
  }
} 