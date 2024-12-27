import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()

    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return new NextResponse('User not found', { status: 404 })
    }

    const build = await prisma.build.findUnique({
      where: {
        id: params.id
      }
    })

    if (!build) {
      return new NextResponse('Build not found', { status: 404 })
    }

    if (build.authorId !== user.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Check if the build is part of a composition by checking if it has a class section
    const buildWithClassSection = await prisma.build.findUnique({
      where: { id: params.id },
      include: { classSection: true }
    })

    if (buildWithClassSection?.classSection) {
      return new NextResponse(
        'Cannot delete a build that belongs to a composition. Delete the composition or remove the build from it.',
        { status: 400 }
      )
    }

    await prisma.build.delete({
      where: {
        id: params.id
      }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('[BUILD_DELETE]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
} 