'use client'

import BuildCreator from '@/components/build-creator'
import type { Build } from '@/lib/types/composition'
import Image from "next/image"
import Link from "next/link"
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface BuildWithRelations extends Build {
  author: {
    id: string
    name: string | null
    image: string | null
  }
  classSection?: {
    id: string
    name: string
    composition?: {
      id: string
      name: string
      contentType: string | null
    }
  }
}

export default function ViewBuildClient({ 
  build,
  isOwner,
  canDelete 
}: { 
  build: BuildWithRelations
  isOwner: boolean
  canDelete: boolean
}) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!canDelete) return
    
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/builds/${build.id}/delete`, {
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error)
      }

      toast.success('Build deleted successfully')
      router.push('/builds')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete build')
      setIsDeleting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-semibold text-zinc-200">{build.name}</h1>
            {build.author.image && (
              <div className="flex items-center gap-2">
                <Image
                  src={build.author.image}
                  alt={build.author.name || 'Author'}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full"
                />
                <span className="text-zinc-400">{build.author.name}</span>
              </div>
            )}
          </div>
          {isOwner && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button
                      onClick={handleDelete}
                      disabled={!canDelete || isDeleting}
                      variant="destructive"
                      className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      {isDeleting ? 'Deleting...' : 'Delete Build'}
                    </Button>
                  </div>
                </TooltipTrigger>
                {!canDelete && build.classSection && (
                  <TooltipContent>
                    <p>This build can only be deleted through its composition</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {build.classSection?.composition && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-500">Part of composition:</span>
            <Link 
              href={`/compositions/${build.classSection.composition.id}`}
              className="text-sm text-[#00E6B4] hover:underline"
            >
              {build.classSection.composition.name}
            </Link>
            {build.classSection.composition.contentType && (
              <span className="text-sm text-zinc-500">
                ({build.classSection.composition.contentType})
              </span>
            )}
          </div>
        )}
      </div>

      <BuildCreator 
        initialBuilds={[build]} 
        showDismissible={false}
        readOnly={!isOwner}
        showSaveButtons={isOwner}
      />
    </div>
  )
} 