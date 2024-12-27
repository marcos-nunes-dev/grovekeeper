'use client'

import { Suspense } from 'react'
import BuildsContent from './builds-content'
import { Skeleton } from '@/components/ui/skeleton'

export default function Builds() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8"><Skeleton className="h-[500px]" /></div>}>
      <BuildsContent />
    </Suspense>
  )
}
