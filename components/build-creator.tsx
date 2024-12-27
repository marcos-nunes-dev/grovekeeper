'use client'

import { useState } from 'react'
import BuildConfiguration from './build-configuration'
import type { Build } from '@/lib/types/composition'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface BuildCreatorProps {
  initialBuilds?: Build[]
  onBuildsChange?: (builds: Build[]) => void
  showDismissible?: boolean
}

export default function BuildCreator({ initialBuilds, onBuildsChange, showDismissible = false }: BuildCreatorProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [builds, setBuilds] = useState<Build[]>(initialBuilds || [
    {
      id: 'initial-build',
      name: 'New Build',
      equipment: {},
      spells: {},
      instructions: '',
      status: 'draft',
      swaps: []
    }
  ])

  const updateBuild = (index: number, updatedBuild: Build) => {
    const newBuilds = [...builds]
    newBuilds[index] = updatedBuild
    setBuilds(newBuilds)
    onBuildsChange?.(newBuilds)
  }

  const removeBuild = (index: number) => {
    const newBuilds = builds.filter((_, i) => i !== index)
    setBuilds(newBuilds)
    onBuildsChange?.(newBuilds)
  }

  const saveBuild = async (build: Build, status: 'draft' | 'published') => {
    if (!session) {
      router.push('/auth/signin')
      return
    }

    try {
      const response = await fetch('/api/builds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...build,
          status,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save build')
      }

      await response.json()
      router.push('/builds')
    } catch (error) {
      console.error('Error saving build:', error)
    }
  }

  return (
    <div className="space-y-6">
      {builds.map((build, index) => (
        <BuildConfiguration
          key={build.id}
          build={build}
          buildIndex={index}
          updateBuild={(updatedBuild) => updateBuild(index, updatedBuild)}
          removeBuild={showDismissible ? () => removeBuild(index) : undefined}
          showDismissible={showDismissible}
        />
      ))}
      
      <div className="flex gap-4">
        <button
          onClick={() => saveBuild(builds[0], 'draft')}
          className="flex-1 p-2 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg text-zinc-400 transition-colors"
        >
          Save as Draft
        </button>
        <button
          onClick={() => saveBuild(builds[0], 'published')}
          className="flex-1 p-2 bg-[#00E6B4] hover:bg-[#1BECA0] rounded-lg text-black font-medium transition-colors"
        >
          Publish Build
        </button>
      </div>
    </div>
  )
}

