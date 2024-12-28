'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import CompositionHeader from '@/components/composition-header'
import ClassSection from '@/components/class-section'
import BuildCreator from '@/components/build-creator'
import type { ClassSection as ClassSectionType } from '@/lib/types/composition'

interface CompositionData {
  id: string
  name: string
  contentType: string
  description: string
  tags: string[]
  classSections: ClassSectionType[]
  author: {
    email: string | null
  }
  createdAt: string
  updatedAt: string
}

export default function CompositionPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [composition, setComposition] = useState<CompositionData | null>(null)
  const [expandedClass, setExpandedClass] = useState<string | null>(null)

  useEffect(() => {
    async function fetchComposition() {
      try {
        const response = await fetch(`/api/compositions/${params.id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch composition')
        }
        const data = await response.json()
        setComposition(data)
      } catch (error) {
        console.error('Error fetching composition:', error)
        toast.error('Failed to load composition')
      } finally {
        setIsLoading(false)
      }
    }

    fetchComposition()
  }, [params.id])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-zinc-400">Loading composition...</div>
      </div>
    )
  }

  if (!composition) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-zinc-400">Composition not found</div>
      </div>
    )
  }

  const isOwner = session?.user?.email === composition.author.email

  const handleUpdateComposition = async () => {
    if (!session) {
      router.push('/auth/signin')
      return
    }

    if (!isOwner) {
      toast.error('You do not have permission to edit this composition')
      return
    }

    setIsSaving(true)

    try {
      const response = await fetch(`/api/compositions/${composition.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: composition.name,
          contentType: composition.contentType,
          description: composition.description,
          tags: composition.tags,
          classSections: composition.classSections,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update composition')
      }

      toast.success('Composition updated successfully')
      router.push('/compositions')
    } catch (error) {
      console.error('Error updating composition:', error)
      toast.error('Failed to update composition')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteComposition = async () => {
    if (!session) {
      router.push('/auth/signin')
      return
    }

    if (!isOwner) {
      toast.error('You do not have permission to delete this composition')
      return
    }

    if (!confirm('Are you sure you want to delete this composition?')) {
      return
    }

    try {
      const response = await fetch(`/api/compositions/${composition.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete composition')
      }

      toast.success('Composition deleted successfully')
      router.push('/compositions')
    } catch (error) {
      console.error('Error deleting composition:', error)
      toast.error('Failed to delete composition')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="bg-[#0D1117] rounded-lg p-6 border border-zinc-800/50 hover:border-zinc-700/50 transition-colors">
        <CompositionHeader
          compositionName={composition.name}
          setCompositionName={(name) => setComposition({ ...composition, name })}
          contentType={composition.contentType}
          setContentType={(contentType) => setComposition({ ...composition, contentType })}
          description={composition.description}
          setDescription={(description) => setComposition({ ...composition, description })}
          tags={composition.tags}
          setTags={(tags) => setComposition({ ...composition, tags })}
          readOnly={!isOwner}
        />
      </div>

      <div className="space-y-4">
        {composition.classSections.map((classSection, index) => (
          <ClassSection
            key={index}
            classSection={classSection}
            classIndex={index}
            expandedClass={expandedClass}
            setExpandedClass={setExpandedClass}
            classSections={composition.classSections}
            setClassSections={(sections) => setComposition({ ...composition, classSections: sections })}
            readOnly={!isOwner}
          >
            <BuildCreator
              initialBuilds={classSection.builds}
              onBuildsChange={(newBuilds) => {
                const updatedSections = [...composition.classSections]
                updatedSections[index].builds = newBuilds
                setComposition({ ...composition, classSections: updatedSections })
              }}
              showDismissible={true}
              showSaveButtons={false}
              readOnly={!isOwner}
            />
          </ClassSection>
        ))}
      </div>

      {isOwner && (
        <div className="flex gap-4">
          <Button
            onClick={handleUpdateComposition}
            disabled={isSaving}
            className="flex-1 py-4 bg-[#00E6B4] text-black hover:bg-[#1BECA0] font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving Changes...' : 'Save Changes'}
          </Button>
          <Button
            onClick={handleDeleteComposition}
            variant="destructive"
            className="py-4 bg-red-600 hover:bg-red-700 text-white font-semibold"
          >
            Delete Composition
          </Button>
        </div>
      )}
    </div>
  )
} 