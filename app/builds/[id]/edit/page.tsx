import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import BuildCreator from '@/components/build-creator'
import type { Build } from '@/lib/types/composition'
import Link from 'next/link'

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
      },
      classSection: {
        include: {
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

  if (!build) {
    redirect('/builds')
  }

  // Check if the user is the author of the build
  if (build.author.email !== session.user.email) {
    redirect('/builds')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-zinc-200">Edit Build</h1>
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
        initialBuilds={[build as unknown as Build]} 
        showDismissible={false}
      />
    </div>
  )
} 