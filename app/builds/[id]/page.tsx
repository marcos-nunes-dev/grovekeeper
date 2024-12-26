import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import BuildView from '@/components/build-view'
import type { Build } from '@/lib/types/composition'
import { getServerSession } from 'next-auth'

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

  const isAuthor = session?.user?.email === build.author.email

  return (
    <div className="container mx-auto px-4 py-8">
      <BuildView 
        build={build as unknown as Build & { author: { name: string | null; image: string | null; email: string | null } }}
        isAuthor={isAuthor}
      />
    </div>
  )
} 