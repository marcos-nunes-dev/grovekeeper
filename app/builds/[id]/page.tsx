import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import BuildCreator from '@/components/build-creator'
import type { Build } from '@/lib/types/composition'
import { getServerSession } from 'next-auth'
import Image from "next/image"
import Link from "next/link"

export default async function ViewBuild({ params }: { params: { id: string } }) {
  const session = await getServerSession()
  const build = await prisma.build.findUnique({
    where: {
      id: params.id,
    },
    include: {
      author: {
        select: {
          name: true,
          image: true,
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

  const isOwner = session?.user?.email === build.author.email

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
            <Link 
              href={`/builds/${build.id}/edit`}
              className="px-4 py-2 bg-[#00E6B4] hover:bg-[#1BECA0] text-black font-medium rounded-lg transition-colors"
            >
              Edit Build
            </Link>
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
        initialBuilds={[build as unknown as Build]} 
        showDismissible={false}
        readOnly={!isOwner}
        showSaveButtons={true}
      />
    </div>
  )
} 