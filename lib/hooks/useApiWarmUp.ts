import { useEffect, useState } from 'react'

export function useApiWarmUp() {
  const [isWarming, setIsWarming] = useState(true)
  const [warmUpStatus, setWarmUpStatus] = useState<{
    search: string
    members: string
    player: string
  } | null>(null)

  useEffect(() => {
    const warmUp = async () => {
      try {
        const response = await fetch('/api/warm-up')
        const data = await response.json()
        
        if (data.status === 'completed') {
          setWarmUpStatus(data.results)
        }
      } catch (error) {
        console.error('Failed to warm up APIs:', error)
      } finally {
        setIsWarming(false)
      }
    }

    warmUp()
  }, [])

  return { isWarming, warmUpStatus }
} 