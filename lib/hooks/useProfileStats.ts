import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface Stats {
  // Regear stats
  deathsAnalyzed: number
  silverCalculated: number
  // Profile stats
  playersTracked: number
  totalPveFame: number
  totalPvpFame: number
}

interface StatsUpdate {
  // Regear stats
  value?: number
  deathsCount?: number
  // Profile stats
  playersTracked?: number
  pveFame?: number
  pvpFame?: number
}

// Fetch statistics
export function useProfileStats() {
  return useQuery<Stats>({
    queryKey: ['profileStats'],
    queryFn: async () => {
      const response = await fetch('/api/profile-stats')
      if (!response.ok) {
        throw new Error('Failed to fetch statistics')
      }
      return response.json()
    }
  })
}

// Update statistics mutation
export function useUpdateProfileStats() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (update: StatsUpdate) => {
      try {
        const response = await fetch('/api/profile-stats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(update)
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
    onMutate: async (update: StatsUpdate) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['profileStats'] })

      // Snapshot the previous value
      const previousStats = queryClient.getQueryData<Stats>(['profileStats'])

      // Optimistically update to the new value
      if (previousStats) {
        const newStats = {
          ...previousStats,
          deathsAnalyzed: previousStats.deathsAnalyzed + (update.deathsCount || 0),
          silverCalculated: previousStats.silverCalculated + (update.value || 0),
          playersTracked: previousStats.playersTracked + (update.playersTracked || 0),
          totalPveFame: previousStats.totalPveFame + (update.pveFame || 0),
          totalPvpFame: previousStats.totalPvpFame + (update.pvpFame || 0)
        }
        queryClient.setQueryData<Stats>(['profileStats'], newStats)
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
        queryClient.setQueryData(['profileStats'], context.previousStats)
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we're in sync
      queryClient.invalidateQueries({ queryKey: ['profileStats'] })
    }
  })
}
