import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

interface Swap {
  itemId: string
  spells: {
    activeSpells: number[]
    passiveSpells: number[]
  }
}

interface CreateBuild {
  name: string
  class?: string
  content?: string
  difficulty?: string
  costTier?: string
  instructions?: string
  equipment: {
    head?: string
    cape?: string
    mainHand?: string
    offHand?: string
    chest?: string
    shoes?: string
    potion?: string
    food?: string
    mount?: string
  }
  spells: {
    [itemId: string]: {
      activeSpells: number[]
      passiveSpells: number[]
    }
  }
  swaps: Swap[]
}

interface CreateClassSection {
  name: string
  builds: CreateBuild[]
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const composition = await prisma.composition.findUnique({
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
        classSections: {
          include: {
            builds: true
          }
        }
      }
    })

    if (!composition) {
      return new NextResponse('Composition not found', { status: 404 })
    }

    return NextResponse.json(composition)
  } catch (error) {
    console.error('Error fetching composition:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const composition = await prisma.composition.findUnique({
      where: {
        id: params.id,
      },
      include: {
        author: {
          select: {
            id: true,
            email: true
          }
        }
      }
    })

    if (!composition) {
      return new NextResponse('Composition not found', { status: 404 })
    }

    if (composition.author.email !== session.user.email) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const body = await request.json()
    const { name, contentType, description, tags, classSections } = body

    // First, delete all existing class sections and their builds
    await prisma.classSection.deleteMany({
      where: {
        compositionId: params.id
      }
    })

    // Then create new class sections with their builds
    const updatedComposition = await prisma.composition.update({
      where: {
        id: params.id,
      },
      data: {
        name,
        contentType,
        description,
        tags,
        classSections: {
          create: classSections.map((section: CreateClassSection) => ({
            name: section.name,
            builds: {
              create: section.builds.map((build) => ({
                name: build.name,
                class: build.class,
                content: build.content,
                difficulty: build.difficulty,
                costTier: build.costTier,
                instructions: build.instructions,
                equipment: build.equipment,
                spells: build.spells,
                swaps: build.swaps,
                status: 'published'
              }))
            }
          }))
        }
      },
      include: {
        classSections: {
          include: {
            builds: true
          }
        }
      }
    })

    return NextResponse.json(updatedComposition)
  } catch (error) {
    console.error('Error updating composition:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const composition = await prisma.composition.findUnique({
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

    if (!composition) {
      return new NextResponse('Composition not found', { status: 404 })
    }

    if (composition.author.email !== session.user.email) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    await prisma.composition.delete({
      where: {
        id: params.id,
      }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting composition:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 