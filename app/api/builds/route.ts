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

    const build = await prisma.build.create({
      data: {
        name: buildData.name,
        role: buildData.role,
        content: buildData.content,
        difficulty: buildData.difficulty,
        costTier: buildData.costTier,
        instructions: buildData.instructions,
        status: buildData.status,
        equipment: buildData.equipment,
        spells: buildData.spells,
        swaps: buildData.swaps || [],
        authorId: user.id
      }
    })

    return NextResponse.json(build)
  } catch (error) {
    console.error('Error creating build:', error)
    return NextResponse.json(
      { error: 'Failed to create build' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions) as Session
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')

  try {
    const builds = await prisma.build.findMany({
      where: {
        ...(session?.user?.email ? {
          author: {
            email: session.user.email
          }
        } : {}),
        ...(status ? { status } : {})
      },
      orderBy: {
        createdAt: 'desc'
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