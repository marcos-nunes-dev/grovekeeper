interface GuildHistoryEntry {
  name: string;
  seenAt: string;
}

interface UpdateMessage {
  data?: GuildHistoryEntry[];
  error?: string;
  details?: string;
  cacheStatus?: {
    isStale: boolean;
    isUpdating: boolean;
  };
  hasDeepSearched?: boolean;
}

// Global map to store SSE controllers with automatic cleanup after 5 minutes
const historyUpdateControllers = new Map<string, {
  controller: ReadableStreamDefaultController;
  timeout: NodeJS.Timeout;
}>()

const STREAM_TIMEOUT = 5 * 60 * 1000 // 5 minutes

export function getOrCreateStream(playerName: string, request: Request) {
  return new ReadableStream({
    start(controller) {
      // Clear any existing controller for this player
      const existing = historyUpdateControllers.get(playerName)
      if (existing) {
        clearTimeout(existing.timeout)
        existing.controller.close()
      }

      // Set up automatic cleanup after timeout
      const timeout = setTimeout(() => {
        const entry = historyUpdateControllers.get(playerName)
        if (entry) {
          entry.controller.close()
          historyUpdateControllers.delete(playerName)
        }
      }, STREAM_TIMEOUT)

      // Store the new controller with its timeout
      historyUpdateControllers.set(playerName, {
        controller,
        timeout
      })

      // Clean up when client disconnects
      request.signal.addEventListener('abort', () => {
        const entry = historyUpdateControllers.get(playerName)
        if (entry) {
          clearTimeout(entry.timeout)
          entry.controller.close()
          historyUpdateControllers.delete(playerName)
        }
      })
    }
  })
}

export async function sendHistoryUpdate(playerName: string, message: UpdateMessage) {
  const entry = historyUpdateControllers.get(playerName)
  if (entry) {
    try {
      const encoder = new TextEncoder()
      const messageText = encoder.encode(`data: ${JSON.stringify(message)}\n\n`)
      entry.controller.enqueue(messageText)
    } catch (error) {
      console.error(`Error sending history update for ${playerName}:`, error)
      // Clean up the connection if we can't send updates
      clearTimeout(entry.timeout)
      entry.controller.close()
      historyUpdateControllers.delete(playerName)
    }
  }
} 