import { useQuery } from '@tanstack/react-query'
import type { RegearResult } from '@/lib/types/regear'
import { KillboardError } from '@/lib/utils/errors'
import { getKillboardData } from '@/lib/services/regear'


// Equivalent items for price conversion
const EQUIVALENT_ITEMS = [
  'T4_SKILLBOOK_STANDARD',
  'TREASURE_DECORATIVE_RARITY1',
  'UNIQUE_GVGTOKEN_GENERIC'
] as const

export type PriceEquivalent = typeof EQUIVALENT_ITEMS[number]

interface EquivalentPrices {
  T4_SKILLBOOK_STANDARD: number
  TREASURE_DECORATIVE_RARITY1: number
  UNIQUE_GVGTOKEN_GENERIC: number
}



// Fetch equivalent item prices
export function useEquivalentPrices() {
  return useQuery<EquivalentPrices>({
    queryKey: ['equivalentPrices'],
    queryFn: async () => {
      try {
        // All equivalent items are normal quality (1)
        const itemsWithQuality = EQUIVALENT_ITEMS.map(item => `${item}:1`).join(',')
        const response = await fetch(`/api/prices/v2?items=${itemsWithQuality}`)
        if (!response.ok) throw new Error('Failed to fetch equivalent prices')
        const data = await response.json()
        
        // Extract average prices for each item
        return {
          T4_SKILLBOOK_STANDARD: data.T4_SKILLBOOK_STANDARD?.[1]?.avg_price ?? 0,
          TREASURE_DECORATIVE_RARITY1: data.TREASURE_DECORATIVE_RARITY1?.[1]?.avg_price ?? 0,
          UNIQUE_GVGTOKEN_GENERIC: data.UNIQUE_GVGTOKEN_GENERIC?.[1]?.avg_price ?? 0
        }
      } catch (error) {
        console.error('Error fetching equivalent prices:', error)
        throw error
      }
    },
    // Cache for 5 minutes
    staleTime: 5 * 60 * 1000,
    // Keep in cache for 30 minutes
    gcTime: 30 * 60 * 1000,
    // Initialize with zeros to avoid loading state
    placeholderData: {
      T4_SKILLBOOK_STANDARD: 0,
      TREASURE_DECORATIVE_RARITY1: 0,
      UNIQUE_GVGTOKEN_GENERIC: 0
    }
  })
}

// Fetch killboard data
export function useKillboardData(killboardUrl: string | null) {
  return useQuery<RegearResult>({
    queryKey: ['killboard', killboardUrl],
    queryFn: async () => {
      if (!killboardUrl) {
        throw new KillboardError('No killboard URL provided', 'INVALID_URL')
      }
      
      // Use the existing getKillboardData function that was working before
      return getKillboardData(killboardUrl)
    },
    enabled: Boolean(killboardUrl?.trim()),
    retry: (failureCount, error) => {
      // Don't retry on validation errors
      if (error instanceof KillboardError && 
          ['INVALID_URL', 'VALIDATION_ERROR'].includes(error.code)) {
        return false
      }
      // Retry API errors up to 3 times
      return failureCount < 3
    },
    // Cache successful responses for 5 minutes
    staleTime: 5 * 60 * 1000,
    // Keep data in cache for 30 minutes
    gcTime: 30 * 60 * 1000
  })
}
