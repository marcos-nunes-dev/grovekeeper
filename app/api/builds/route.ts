import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { GET as authOptions } from '../auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import type { Build } from '@/lib/types/composition'
import type { Session } from 'next-auth'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions) as Session

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const buildData: Build = await request.json()

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // If build has an ID, update instead of create
    if (buildData.id && buildData.id !== 'initial-build') {
      // Check if user owns the build
      const existingBuild = await prisma.build.findUnique({
        where: { id: buildData.id },
        include: { author: true }
      })

      if (!existingBuild || existingBuild.author.email !== session.user.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const buildUpdateData = {
        name: buildData.name,
        content: buildData.content,
        difficulty: buildData.difficulty,
        costTier: buildData.costTier,
        instructions: buildData.instructions,
        status: buildData.status,
        equipment: buildData.equipment,
        spells: buildData.spells,
        swaps: JSON.parse(JSON.stringify(buildData.swaps || []))
      }

      const updatedBuild = await prisma.build.update({
        where: { id: buildData.id },
        data: buildUpdateData
      })

      return NextResponse.json(updatedBuild)
    }

    // Create new build if no ID or initial-build ID
    const buildDataForDb = {
      name: buildData.name,
      content: buildData.content,
      difficulty: buildData.difficulty,
      costTier: buildData.costTier,
      instructions: buildData.instructions,
      status: buildData.status,
      equipment: buildData.equipment,
      spells: buildData.spells,
      swaps: JSON.parse(JSON.stringify(buildData.swaps || [])),
      authorId: user.id
    }

    const build = await prisma.build.create({
      data: buildDataForDb
    })

    return NextResponse.json(build)
  } catch (error) {
    console.error('Error creating/updating build:', error)
    return NextResponse.json(
      { error: 'Failed to create/update build' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')

    const builds = await prisma.build.findMany({
      where: search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { instructions: { contains: search, mode: 'insensitive' } }
        ]
      } : undefined,
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
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return NextResponse.json(builds)
  } catch (error) {
    console.error('Error fetching builds:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 