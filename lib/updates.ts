import type { PlayerData } from '@/types/albion'

export interface UpdateResponse {
  data: PlayerData
  cacheStatus: {
    isStale: boolean
    isUpdating: boolean
  }
}

export interface ErrorResponse {
  error: string
  details?: string
}

export type SSEResponse = UpdateResponse | ErrorResponse

const clients = new Map<string, Set<(data: SSEResponse) => void>>()

export function sendUpdate(playerName: string, data: SSEResponse) {
  const key = playerName.toLowerCase()
  const handlers = clients.get(key)
  if (handlers) {
    handlers.forEach(handler => handler(data))
  }
}

export function getOrCreateClientHandlers(playerName: string) {
  const key = playerName.toLowerCase()
  if (!clients.has(key)) {
    clients.set(key, new Set())
  }
  return clients.get(key)!
}

export function removeClientHandler(playerName: string, handler: (data: SSEResponse) => void) {
  const key = playerName.toLowerCase()
  const handlers = clients.get(key)
  if (handlers) {
    handlers.delete(handler)
    if (handlers.size === 0) {
      clients.delete(key)
    }
  }
} 