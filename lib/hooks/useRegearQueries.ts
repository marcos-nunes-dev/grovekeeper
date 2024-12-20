import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { RegearResult, KillboardResponse } from '@/lib/types/regear'
import { KillboardError } from '@/lib/utils/errors'
import { getKillboardData } from '@/lib/services/regear'

interface Stats {
  deathsAnalyzed: number
  silverCalculated: number
}

// Fetch statistics
export function useRegearStats() {
  return useQuery<Stats>({
    queryKey: ['regearStats'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/regear-stats')
        if (!response.ok) throw new Error('Failed to fetch statistics')
        return response.json()
      } catch (error) {
        console.error('Error fetching stats:', error)
        throw error
      }
    },
    // Refetch on window focus to keep stats in sync
    refetchOnWindowFocus: true,
    // Cache for 1 minute
    staleTime: 60 * 1000
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

// Update statistics mutation
export function useUpdateStats() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (totalSilver: number) => {
      try {
        const response = await fetch('/api/regear-stats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ totalSilver })
        })
        if (!response.ok) throw new Error('Failed to update statistics')
        const data = await response.json()
        return data as Stats
      } catch (error) {
        console.error('Error updating stats:', error)
        throw error
      }
    },
    onMutate: async (totalSilver: number) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['regearStats'] })

      // Snapshot the previous value
      const previousStats = queryClient.getQueryData<Stats>(['regearStats'])

      // Optimistically update to the new value
      if (previousStats) {
        queryClient.setQueryData<Stats>(['regearStats'], {
          deathsAnalyzed: previousStats.deathsAnalyzed + 1,
          silverCalculated: previousStats.silverCalculated + totalSilver
        })
      }

      return { previousStats }
    },
    onError: (err, variables, context) => {
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