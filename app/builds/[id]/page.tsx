import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import ViewBuildClient from './client'
import type { Build } from '@/lib/types/composition'

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

export default async function BuildPage({ params }: { params: { id: string } }) {
  const session = await getServerSession()

  if (!session?.user?.email) {
    redirect('/auth/signin')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })

  if (!user) {
    redirect('/auth/signin')
  }

  const dbBuild = await prisma.build.findUnique({
    where: {
      id: params.id
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true
        }
      },
      classSection: {
        select: {
          id: true,
          name: true,
          composition: {
            select: {
              id: true,
              name: true,
              contentType: true
            }
          }
        }
      }
    }
  })

  if (!dbBuild) {
    redirect('/builds')
  }

  const isOwner = user.id === dbBuild.authorId
  const canDelete = isOwner && !dbBuild.classSection

  return (
    <ViewBuildClient
      build={dbBuild as unknown as BuildWithRelations}
      isOwner={isOwner}
      canDelete={canDelete}
    />
  )
} 