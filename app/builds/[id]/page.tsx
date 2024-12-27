import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import ViewBuildClient from './client'

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
      author: true,
      classSection: {
        include: {
          composition: true
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
      build={dbBuild as any}
      isOwner={isOwner}
      canDelete={canDelete}
    />
  )
} 