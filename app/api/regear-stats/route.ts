import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get or create the statistics record
    const stats = await prisma.grovekeeperStatistics.upsert({
      where: {
        id: 'singleton'
      },
      create: {
        id: 'singleton',
        deathsAnalyzed: BigInt(0),
        silverCalculated: BigInt(0)
      },
      update: {}
    })

    return NextResponse.json({
      deathsAnalyzed: Number(stats.deathsAnalyzed),
      silverCalculated: Number(stats.silverCalculated)
    })
  } catch (error) {
    console.error('Error fetching statistics:', error)
    // Check if it's a Prisma error
    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Failed to fetch statistics', details: error.message },
        { status: 500 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { value, deathsCount } = await request.json()

    // Convert to BigInt and ensure positive values
    const silverValue = BigInt(Math.max(0, Math.floor(value)))
    const deaths = BigInt(Math.max(0, Math.floor(deathsCount)))

    // Atomically increment both counters
    const stats = await prisma.grovekeeperStatistics.upsert({
      where: {
        id: 'singleton'
      },
      create: {
        id: 'singleton',
        deathsAnalyzed: deaths,
        silverCalculated: silverValue
      },
      update: {
        deathsAnalyzed: {
          increment: deaths
        },
        silverCalculated: {
          increment: silverValue
        }
      }
    })

    return NextResponse.json({
      deathsAnalyzed: Number(stats.deathsAnalyzed),
      silverCalculated: Number(stats.silverCalculated)
    })
  } catch (error) {
    console.error('Error updating statistics:', error)
    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Failed to update statistics', details: error.message },
        { status: 500 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update statistics' },
      { status: 500 }
    )
  }
} 