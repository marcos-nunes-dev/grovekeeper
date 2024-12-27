import { useEffect, DependencyList } from 'react'

export function useDebounce(fn: () => void, delay: number, deps: DependencyList) {
  useEffect(() => {
    const timeoutId = setTimeout(fn, delay)
    return () => clearTimeout(timeoutId)
  }, [...deps, fn, delay])
} 