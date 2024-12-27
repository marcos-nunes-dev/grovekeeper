'use client'
 
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
 
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])
 
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <h2 className="text-xl font-semibold">Something went wrong!</h2>
      <p className="text-sm text-zinc-400">
        {error.message || 'An error occurred while loading the attendance tracker.'}
      </p>
      <Button
        onClick={reset}
        variant="outline"
      >
        Try again
      </Button>
    </div>
  )
} 