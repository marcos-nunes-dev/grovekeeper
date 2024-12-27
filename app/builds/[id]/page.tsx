import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import BuildCreator from '@/components/build-creator'
import type { Build } from '@/lib/types/composition'

export default async function ViewBuild({ params }: { params: { id: string } }) {
  const build = await prisma.build.findUnique({
    where: {
      id: params.id,
    },
    include: {
      author: {
        select: {
          name: true,
          image: true
        }
      }
    }
  })

  if (!build) {
    redirect('/builds')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-zinc-200">{build.name}</h1>
        {build.author.image && (
          <div className="flex items-center gap-2">
            <img 
              src={build.author.image} 
              alt={build.author.name || 'Author'} 
              className="w-8 h-8 rounded-full"
            />
            <span className="text-zinc-400">{build.author.name}</span>
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