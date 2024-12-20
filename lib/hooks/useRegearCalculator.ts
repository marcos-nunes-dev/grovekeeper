import { useCallback, useReducer, useEffect } from 'react'
import { getKillboardData } from '@/lib/services/regear'
import { KillboardError, getErrorMessage } from '@/lib/utils/errors'
import type { RegearResult } from '@/lib/types/regear'

type Stats = {
  deathsAnalyzed: number
  silverCalculated: number
}

type State = {
  url: string
  result: RegearResult | null
  loading: boolean
  error: string | null
  stats: Stats | null
}

type Action =
  | { type: 'SET_URL'; payload: string }
  | { type: 'START_CALCULATION' }
  | { type: 'CALCULATION_SUCCESS'; payload: RegearResult }
  | { type: 'CALCULATION_ERROR'; payload: unknown }
  | { type: 'SET_STATS'; payload: Stats }
  | { type: 'RESET' }

const initialState: State = {
  url: '',
  result: null,
  loading: false,
  error: null,
  stats: null
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_URL':
      return { ...state, url: action.payload, error: null }
    case 'START_CALCULATION':
      return { ...state, loading: true, error: null, result: null }
    case 'CALCULATION_SUCCESS':
      return { ...state, loading: false, result: action.payload, error: null }
    case 'CALCULATION_ERROR':
      return { 
        ...state, 
        loading: false, 
        error: getErrorMessage(action.payload),
        result: null 
      }
    case 'SET_STATS':
      return { ...state, stats: action.payload }
    case 'RESET':
      return initialState
    default:
      return state
  }
}

export function useRegearCalculator() {
  const [state, dispatch] = useReducer(reducer, initialState)

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/regear-stats')
      if (!response.ok) throw new Error('Failed to fetch stats')
      const stats = await response.json()
      dispatch({ type: 'SET_STATS', payload: stats })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const setUrl = useCallback((url: string) => {
    dispatch({ type: 'SET_URL', payload: url })
  }, [])

  const calculate = useCallback(async () => {
    if (!state.url.trim()) {
      dispatch({ 
        type: 'CALCULATION_ERROR', 
        payload: new KillboardError('Please enter a killboard URL', 'INVALID_URL')
      })
      return
    }

    dispatch({ type: 'START_CALCULATION' })

    try {
      const data = await getKillboardData(state.url)
      dispatch({ type: 'CALCULATION_SUCCESS', payload: data })

      // Save the calculation to the database
      const killboardId = state.url.split('/').pop() || ''
      await fetch('/api/regear-stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          killboardId,
          totalSilver: Math.floor(data.total.value)
        })
      })

      // Refresh stats after calculation
      fetchStats()
    } catch (error) {
      dispatch({ type: 'CALCULATION_ERROR', payload: error })
    }
  }, [state.url, fetchStats])

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' })
  }, [])

  return {
    ...state,
    setUrl,
    calculate,
    reset
  }
} 