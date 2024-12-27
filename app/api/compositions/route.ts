import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')

    const compositions = await prisma.composition.findMany({
      where: search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { contentType: { contains: search, mode: 'insensitive' } },
          { tags: { hasSome: [search] } },
          {
            classSections: {
              some: {
                name: { contains: search, mode: 'insensitive' }
              }
            }
          },
          {
            classSections: {
              some: {
                builds: {
                  some: {
                    OR: [
                      { name: { contains: search, mode: 'insensitive' } },
                      { instructions: { contains: search, mode: 'insensitive' } },
                      { class: { contains: search, mode: 'insensitive' } },
                      { content: { contains: search, mode: 'insensitive' } }
                    ]
                  }
                }
              }
            }
          }
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
        classSections: {
          include: {
            builds: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return NextResponse.json(compositions)
  } catch (error) {
    console.error('Error fetching compositions:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Get the user's ID from their email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return new NextResponse('User not found', { status: 404 })
    }

    const body = await request.json()
    const { name, contentType, description, tags, classSections } = body

    const composition = await prisma.composition.create({
      data: {
        name,
        contentType,
        description,
        tags,
        authorId: user.id,
        classSections: {
          create: classSections.map((section: any) => ({
            name: section.name,
            builds: {
              create: section.builds.map((build: any) => ({
                name: build.name,
                class: build.class,
                content: build.content,
                difficulty: build.difficulty,
                costTier: build.costTier,
                instructions: build.instructions,
                equipment: build.equipment,
                spells: build.spells,
                swaps: build.swaps,
                status: build.status,
                authorId: user.id
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

    return NextResponse.json(composition)
  } catch (error) {
    console.error('Error creating composition:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 