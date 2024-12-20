import { useCallback, useState, useEffect, useRef } from 'react'
import { useRegearStats, useKillboardData, useUpdateStats } from './useRegearQueries'
import { KillboardError } from '@/lib/utils/errors'

export function useRegearCalculator() {
  const [url, setUrl] = useState('')
  const [submittedUrl, setSubmittedUrl] = useState<string | null>(null)
  const hasUpdatedStats = useRef(false)

  // Queries
  const { data: stats, isLoading: isLoadingStats } = useRegearStats()
  const { 
    data: result, 
    isLoading: isLoadingKillboard, 
    error: queryError,
    isSuccess,
    isError
  } = useKillboardData(submittedUrl)
  const updateStats = useUpdateStats()

  const calculate = useCallback(async () => {
    if (!url.trim()) {
      throw new KillboardError('Please enter a killboard URL', 'INVALID_URL')
    }

    // Reset the stats update flag when starting a new calculation
    hasUpdatedStats.current = false
    setSubmittedUrl(url)
  }, [url])

  // Effect to update stats when result is available
  useEffect(() => {
    const shouldUpdateStats = 
      isSuccess && 
      result?.total?.value && 
      !hasUpdatedStats.current && 
      !updateStats.isPending

    if (shouldUpdateStats) {
      hasUpdatedStats.current = true
      const totalValue = Math.floor(result.total.value)
      updateStats.mutate(totalValue)
    }
  }, [isSuccess, result, updateStats])

  // Reset the stats update flag when URL changes
  useEffect(() => {
    hasUpdatedStats.current = false
  }, [url])

  const error = isError && queryError instanceof Error ? queryError.message : null

  return {
    url,
    result,
    loading: isLoadingKillboard || isLoadingStats || updateStats.isPending,
    error,
    stats,
    setUrl,
    calculate
  }
} 