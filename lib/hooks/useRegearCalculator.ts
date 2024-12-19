import { useCallback, useReducer } from 'react'
import { getKillboardData } from '@/lib/services/regear'
import { KillboardError, getErrorMessage } from '@/lib/utils/errors'
import type { RegearResult } from '@/lib/types/regear'

type State = {
  url: string
  result: RegearResult | null
  loading: boolean
  error: string | null
}

type Action =
  | { type: 'SET_URL'; payload: string }
  | { type: 'START_CALCULATION' }
  | { type: 'CALCULATION_SUCCESS'; payload: RegearResult }
  | { type: 'CALCULATION_ERROR'; payload: unknown }
  | { type: 'RESET' }

const initialState: State = {
  url: '',
  result: null,
  loading: false,
  error: null
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
    case 'RESET':
      return initialState
    default:
      return state
  }
}

export function useRegearCalculator() {
  const [state, dispatch] = useReducer(reducer, initialState)

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
    } catch (error) {
      dispatch({ type: 'CALCULATION_ERROR', payload: error })
    }
  }, [state.url])

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