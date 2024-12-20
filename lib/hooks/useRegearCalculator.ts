import { useCallback, useState, useEffect, useRef } from 'react'
import { useRegearStats, useKillboardData, useUpdateStats } from './useRegearQueries'
import { KillboardError } from '@/lib/utils/errors'
import { getGroupKillboardData } from '@/lib/services/regear'
import type { GroupRegearResult } from '@/lib/types/regear'

export function useRegearCalculator() {
  const [url, setUrl] = useState('')
  const [submittedUrl, setSubmittedUrl] = useState<string | null>(null)
  const [groupResult, setGroupResult] = useState<GroupRegearResult | null>(null)
  const [groupLoading, setGroupLoading] = useState(false)
  const [groupError, setGroupError] = useState<string | null>(null)
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

  const calculateGroup = useCallback(async () => {
    if (!url.trim()) return

    setGroupLoading(true)
    setGroupError(null)
    setGroupResult(null)
    hasUpdatedStats.current = false

    try {
      const result = await getGroupKillboardData(url)
      setGroupResult(result)
      
      // Update stats with total value and increment deaths by the number of valid results
      if (!updateStats.isPending) {
        hasUpdatedStats.current = true
        const validDeaths = result.results.length // Count only successful results
        updateStats.mutate({
          value: Math.floor(result.total.value),
          deathsCount: validDeaths
        })
      }
    } catch (error) {
      setGroupError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setGroupLoading(false)
    }
  }, [url, updateStats])

  // Effect to update stats when individual result is available
  useEffect(() => {
    const shouldUpdateStats = 
      isSuccess && 
      result?.total?.value && 
      !hasUpdatedStats.current && 
      !updateStats.isPending

    if (shouldUpdateStats) {
      hasUpdatedStats.current = true
      // For individual mode, increment deaths by 1
      updateStats.mutate({
        value: Math.floor(result.total.value),
        deathsCount: 1
      })
    }
  }, [isSuccess, result, updateStats])

  // Reset the stats update flag when URL changes
  useEffect(() => {
    // Only reset for individual mode (when using submittedUrl)
    if (submittedUrl !== null) {
      hasUpdatedStats.current = false
    }
  }, [submittedUrl])

  const error = isError && queryError instanceof Error ? queryError.message : groupError

  return {
    url,
    result,
    groupResult,
    loading: isLoadingKillboard || isLoadingStats || updateStats.isPending || groupLoading,
    error,
    stats,
    setUrl,
    calculate,
    calculateGroup
  }
} 