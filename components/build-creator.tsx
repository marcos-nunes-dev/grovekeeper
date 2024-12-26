'use client'

import { useState } from 'react'
import BuildConfiguration from './build-configuration'
import { Button } from '@/components/ui/button'
import type { Build } from '@/lib/types/composition'

interface BuildCreatorProps {
  initialBuilds?: Build[]
  onBuildsChange?: (builds: Build[]) => void
  showDismissible?: boolean
}

export default function BuildCreator({ initialBuilds, onBuildsChange, showDismissible = false }: BuildCreatorProps) {
  const [builds, setBuilds] = useState<Build[]>(initialBuilds || [
    {
      id: 'initial-build',
      name: 'New Build',
      equipment: {},
      skills: {},
      instructions: ''
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

  const handleSave = () => {
    console.log('Saving build:', builds[0])
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
      
      <Button
        onClick={handleSave}
        className="w-full bg-[#00E6B4] text-black hover:bg-[#1BECA0] font-semibold"
      >
        Save Build
      </Button>
    </div>
  )
}

