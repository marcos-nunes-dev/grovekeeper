'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import CompositionHeader from './composition-header'
import ClassSection from './class-section'
import BuildCreator from './build-creator'
import type { ClassSection as ClassSectionType, Build } from '@/lib/types/composition'
import { toast } from 'sonner'

export default function CompositionBuilder() {
  const router = useRouter()
  const { data: session } = useSession()
  const [compositionName, setCompositionName] = useState('')
  const [contentType, setContentType] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [classSections, setClassSections] = useState<ClassSectionType[]>([])
  const [expandedClass, setExpandedClass] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const addClassSection = () => {
    const newSection: ClassSectionType = {
      name: '',
      builds: []
    }
    setClassSections([...classSections, newSection])
  }

  const updateBuilds = (classIndex: number, newBuilds: Build[]) => {
    const updatedSections = [...classSections]
    updatedSections[classIndex].builds = newBuilds
    setClassSections(updatedSections)
  }

  const addBuildToClass = (classIndex: number) => {
    const updatedSections = [...classSections]
    const newBuild: Build = {
      id: crypto.randomUUID(),
      name: 'New Build',
      equipment: {},
      spells: {},
      swaps: [],
      status: 'draft',
      instructions: '',
      content: contentType,
      class: updatedSections[classIndex].name
    }
    updatedSections[classIndex].builds.push(newBuild)
    setClassSections(updatedSections)
  }

  const handleCreateComposition = async () => {
    if (!session) {
      router.push('/auth/signin')
      return
    }

    if (!compositionName) {
      toast.error('Please enter a composition name')
      return
    }

    if (classSections.length === 0) {
      toast.error('Please add at least one class section')
      return
    }

    if (classSections.some(section => !section.name)) {
      toast.error('Please select a class for all sections')
      return
    }

    if (classSections.some(section => section.builds.length === 0)) {
      toast.error('Please add at least one build to each class section')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/compositions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: compositionName,
          contentType,
          description,
          tags,
          classSections,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create composition')
      }

      toast.success('Composition created successfully')
      router.push('/compositions')
    } catch (error) {
      console.error('Error creating composition:', error)
      toast.error('Failed to create composition. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#0D1117] rounded-lg p-6 border border-zinc-800/50 hover:border-zinc-700/50 transition-colors">
        <CompositionHeader
          compositionName={compositionName}
          setCompositionName={setCompositionName}
          contentType={contentType}
          setContentType={setContentType}
          description={description}
          setDescription={setDescription}
          tags={tags}
          setTags={setTags}
        />
      </div>

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
              showDismissible={true}
              showSaveButtons={false}
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
        onClick={handleCreateComposition}
        disabled={isLoading}
        className="w-full py-4 bg-[#00E6B4] text-black hover:bg-[#1BECA0] font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Creating Composition...' : 'Create Composition'}
      </Button>
    </div>
  )
}

