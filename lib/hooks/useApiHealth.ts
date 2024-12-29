import { useState, useEffect } from 'react'

export function useApiHealth() {
  const [isHealthy, setIsHealthy] = useState<boolean>(true)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch('/api/health')
        const data = await response.json()
        setIsHealthy(data.status === 'ok')
      } catch {
        setIsHealthy(false)
      } finally {
        setIsLoading(false)
      }
    }

    // Check immediately
    checkHealth()

    // Then check every 30 seconds
    const interval = setInterval(checkHealth, 30000)

    return () => clearInterval(interval)
  }, [])

  return { isHealthy, isLoading }
} 