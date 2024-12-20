'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import CompositionHeader from './composition-header'
import ClassSection from './class-section'
import BuildCreator from './build-creator'
import type { ClassSection as ClassSectionType, Build } from '@/lib/types/composition'

export default function CompositionBuilder() {
  const [compositionName, setCompositionName] = useState('')
  const [purpose, setPurpose] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [classSections, setClassSections] = useState<ClassSectionType[]>([])
  const [expandedClass, setExpandedClass] = useState<string | null>(null)

  const addClassSection = () => {
    const newClass: ClassSectionType = {
      name: 'New Class',
      builds: []
    }
    setClassSections([...classSections, newClass])
  }

  const updateBuilds = (classIndex: number, newBuilds: Build[]) => {
    const updatedSections = [...classSections]
    updatedSections[classIndex].builds = newBuilds
    setClassSections(updatedSections)
  }

  const addBuildToClass = (classIndex: number) => {
    const updatedSections = [...classSections]
    const newBuild: Build = {
      id: `build-${Date.now()}`,
      name: `New Build ${updatedSections[classIndex].builds.length + 1}`,
      equipment: {},
      skills: {},
      instructions: ''
    }
    updatedSections[classIndex].builds.push(newBuild)
    setClassSections(updatedSections)
  }

  return (
    <div className="space-y-6">
      <CompositionHeader
        compositionName={compositionName}
        setCompositionName={setCompositionName}
        purpose={purpose}
        setPurpose={setPurpose}
        description={description}
        setDescription={setDescription}
        tags={tags}
        setTags={setTags}
      />

      <div className="space-y-4">
        {classSections.map((classSection, index) => (
          <ClassSection
            key={index}
            classSection={classSection}
            classIndex={index}
            expandedClass={expandedClass}
            setExpandedClass={setExpandedClass}
            classSections={classSections}
            setClassSections={setClassSections}
          >
            <BuildCreator
              initialBuilds={classSection.builds}
              onBuildsChange={(newBuilds) => updateBuilds(index, newBuilds)}
              showDismissible={true} // Enable dismissible option for composition builder
            />
            <Button
              onClick={() => addBuildToClass(index)}
              variant="outline"
              className="w-full mt-4 py-2 bg-[#1C2128] hover:bg-[#252D38] text-zinc-400 border-zinc-800/50 hover:border-zinc-700/50"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Build
            </Button>
          </ClassSection>
        ))}

        <Button
          onClick={addClassSection}
          variant="outline"
          className="w-full py-4 bg-[#0D1117] hover:bg-[#161B22] border-zinc-800/50 hover:border-zinc-700/50 text-zinc-400"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Class
        </Button>
      </div>

      <Button
        onClick={() => console.log({ compositionName, purpose, description, tags, classSections })}
        className="w-full bg-[#00E6B4] text-black hover:bg-[#1BECA0] font-semibold"
      >
        Create Composition
      </Button>
    </div>
  )
}

