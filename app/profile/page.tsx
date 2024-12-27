'use client'

import { Suspense } from 'react'
import ProfileContent from './profile-content'
import { Skeleton } from '@/components/ui/skeleton'

export default function Profile() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8"><Skeleton className="h-[500px]" /></div>}>
      <ProfileContent />
    </Suspense>
  )
}

