import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import BuildCreator from '@/components/build-creator'
import type { Build } from '@/lib/types/composition'

export default async function EditBuild({ params }: { params: { id: string } }) {
  const session = await getServerSession()

  if (!session?.user?.email) {
    redirect('/auth/signin')
  }

  const build = await prisma.build.findUnique({
    where: {
      id: params.id,
    },
    include: {
      author: {
        select: {
          email: true
        }
      }
    }
  })

  if (!build) {
    redirect('/builds')
  }

  // Check if the user is the author of the build
  if (build.author.email !== session.user.email) {
    redirect('/builds')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-zinc-200 mb-6">Edit Build</h1>
      <BuildCreator 
        initialBuilds={[build as unknown as Build]} 
        showDismissible={false}
      />
    </div>
  )
} 