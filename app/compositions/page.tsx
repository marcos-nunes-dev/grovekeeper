'use client'

import { Suspense } from 'react'
import CompositionsContent from './compositions-content'
import { Skeleton } from '@/components/ui/skeleton'

export default function Compositions() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8"><Skeleton className="h-[500px]" /></div>}>
      <CompositionsContent />
    </Suspense>
  )
} 