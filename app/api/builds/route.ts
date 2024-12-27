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
        role: buildData.role,
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
      role: buildData.role,
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
  const session = await getServerSession(authOptions) as Session
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const query = searchParams.get('q')

  try {
    const builds = await prisma.build.findMany({
      where: {
        AND: [
          // Show all statuses for user's builds, but only published for others
          {
            OR: [
              {
                author: {
                  email: session?.user?.email
                }
              },
              {
                status: 'published'
              }
            ]
          },
          // Additional status filter if provided
          status ? { status } : {},
          // Search query if provided
          query ? {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { role: { contains: query, mode: 'insensitive' } },
              { content: { contains: query, mode: 'insensitive' } },
              { difficulty: { contains: query, mode: 'insensitive' } },
              { costTier: { contains: query, mode: 'insensitive' } },
              { instructions: { contains: query, mode: 'insensitive' } },
            ]
          } : {},
        ]
      },
      include: {
        author: {
          select: {
            name: true,
            image: true,
            email: true
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
    return NextResponse.json(
      { error: 'Failed to fetch builds' },
      { status: 500 }
    )
  }
} 