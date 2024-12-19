'use client'

import { useState } from 'react'
import BuildConfiguration from './build-configuration'

interface Build {
  id: string
  name: string
  equipment: {
    mainHand?: string
    offHand?: string
    head?: string
    chest?: string
    shoes?: string
    cape?: string
    food?: string
    potion?: string
    mount?: string
  }
  skills: {
    q?: string
    w?: string
    e?: string
    r?: string
    passive?: string
  }
  instructions: string
}

interface BuildCreatorProps {
  initialBuilds?: Build[]
  onBuildsChange?: (builds: Build[]) => void
  showDismissible?: boolean // New prop to determine if the dismissible option should be shown
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
    </div>
  )
}

