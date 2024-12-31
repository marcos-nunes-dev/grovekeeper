import { useCallback, useState, useEffect, useRef } from 'react'
import { useKillboardData } from './useRegearQueries'
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

  const { 
    data: result, 
    isLoading: isLoadingKillboard, 
    error: queryError,
    isError
  } = useKillboardData(submittedUrl)

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
    } catch (error) {
      setGroupError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setGroupLoading(false)
    }
  }, [url])


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
    loading: isLoadingKillboard || groupLoading,
    error,
    setUrl,
    calculate,
    calculateGroup
  }
} 