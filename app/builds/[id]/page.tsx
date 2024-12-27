import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import BuildCreator from '@/components/build-creator'
import type { Build } from '@/lib/types/composition'
import { getServerSession } from 'next-auth'
import Image from "next/image";

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
      }
    }
  })

  if (!build) {
    redirect('/builds')
  }

  const isOwner = session?.user?.email === build.author.email

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
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
        {isOwner && (
          <a 
            href={`/builds/${build.id}/edit`}
            className="ml-auto px-4 py-2 bg-[#00E6B4] hover:bg-[#1BECA0] text-black font-medium rounded-lg transition-colors"
          >
            Edit Build
          </a>
        )}
      </div>
      <BuildCreator 
        initialBuilds={[build as unknown as Build]} 
        showDismissible={false}
        readOnly={!isOwner}
      />
    </div>
  )
} 