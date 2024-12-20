import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { RegearResult } from '@/lib/types/regear'
import { KillboardError } from '@/lib/utils/errors'
import { getKillboardData } from '@/lib/services/regear'

interface Stats {
  deathsAnalyzed: number
  silverCalculated: number
}

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

// Fetch statistics
export function useRegearStats() {
  return useQuery<Stats>({
    queryKey: ['regearStats'],
    queryFn: async () => {
      const response = await fetch('/api/regear-stats')
      if (!response.ok) {
        throw new Error('Failed to fetch statistics')
      }
      return response.json()
    }
  })
}

// Fetch equivalent item prices
export function useEquivalentPrices() {
  return useQuery<EquivalentPrices>({
    queryKey: ['equivalentPrices'],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/prices?items=${EQUIVALENT_ITEMS.join(',')}`)
        if (!response.ok) throw new Error('Failed to fetch equivalent prices')
        const data = await response.json()
        
        // Extract average prices for each item
        return {
          T4_SKILLBOOK_STANDARD: data.T4_SKILLBOOK_STANDARD?.avg_price ?? 0,
          TREASURE_DECORATIVE_RARITY1: data.TREASURE_DECORATIVE_RARITY1?.avg_price ?? 0,
          UNIQUE_GVGTOKEN_GENERIC: data.UNIQUE_GVGTOKEN_GENERIC?.avg_price ?? 0
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

interface StatsUpdate {
  value: number
  deathsCount: number
}

// Update statistics mutation
export function useUpdateStats() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ value, deathsCount }: StatsUpdate) => {
      try {
        const response = await fetch('/api/regear-stats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value, deathsCount })
        })
        if (!response.ok) {
          throw new Error('Failed to update statistics')
        }
        const data = await response.json()
        return data as Stats
      } catch (error) {
        console.error('Error updating stats:', error)
        throw error
      }
    },
    onMutate: async ({ value, deathsCount }: StatsUpdate) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['regearStats'] })

      // Snapshot the previous value
      const previousStats = queryClient.getQueryData<Stats>(['regearStats'])

      // Optimistically update to the new value
      if (previousStats) {
        const newStats = {
          deathsAnalyzed: previousStats.deathsAnalyzed + deathsCount,
          silverCalculated: previousStats.silverCalculated + value
        }
        queryClient.setQueryData<Stats>(['regearStats'], newStats)
      }

      return { previousStats }
    },
    onError: (
      err: Error,
      variables: StatsUpdate,
      context: { previousStats: Stats | undefined } | undefined
    ) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousStats) {
        queryClient.setQueryData(['regearStats'], context.previousStats)
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we're in sync
      queryClient.invalidateQueries({ queryKey: ['regearStats'] })
    }
  })
} 