"use client"

import { useEffect, useRef, useState } from 'react'
import { formatPrice } from '@/lib/utils/price'

interface AnimatedCounterProps {
  value: number
  duration?: number
  showZeroAsQuestionMarks?: boolean
}

export function AnimatedCounter({ 
  value, 
  duration = 1000,
  showZeroAsQuestionMarks = true 
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const startTimeRef = useRef<number | null>(null)
  const startValueRef = useRef(0)
  const rafRef = useRef<number>()

  useEffect(() => {
    startValueRef.current = displayValue
    startTimeRef.current = null

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp
      const progress = timestamp - startTimeRef.current

      if (progress < duration) {
        const percentage = progress / duration
        const easing = 1 - Math.pow(2, -10 * percentage)
        const currentValue = startValueRef.current + (value - startValueRef.current) * easing
        setDisplayValue(Math.floor(currentValue))
        rafRef.current = requestAnimationFrame(animate)
      } else {
        setDisplayValue(value)
      }
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [value, duration, displayValue])

  return formatPrice(displayValue, showZeroAsQuestionMarks)
}