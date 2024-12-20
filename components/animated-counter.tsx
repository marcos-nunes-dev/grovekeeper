import { useEffect, useRef, useState } from 'react'
import { formatPrice } from '@/lib/utils/price'

interface AnimatedCounterProps {
  value: number
  duration?: number // Duration in milliseconds
}

export function AnimatedCounter({ value, duration = 1000 }: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const startTimeRef = useRef<number | null>(null)
  const startValueRef = useRef(0)
  const frameRef = useRef<number>()

  useEffect(() => {
    startValueRef.current = displayValue
    startTimeRef.current = null

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp
      const progress = timestamp - startTimeRef.current

      if (progress < duration) {
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress / duration, 4)
        const currentValue = Math.floor(
          startValueRef.current + (value - startValueRef.current) * easeOutQuart
        )
        setDisplayValue(currentValue)
        frameRef.current = requestAnimationFrame(animate)
      } else {
        setDisplayValue(value)
      }
    }

    frameRef.current = requestAnimationFrame(animate)

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [value, duration])

  return <span>{formatPrice(displayValue)}</span>
} 