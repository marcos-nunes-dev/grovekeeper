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
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { totalSilver } = await request.json()

    // Atomically increment both counters
    const stats = await prisma.grovekeeperStatistics.upsert({
      where: {
        id: 'singleton'
      },
      create: {
        id: 'singleton',
        deathsAnalyzed: BigInt(1),
        silverCalculated: BigInt(totalSilver)
      },
      update: {
        deathsAnalyzed: {
          increment: 1
        },
        silverCalculated: {
          increment: totalSilver
        }
      }
    })

    return NextResponse.json({
      deathsAnalyzed: Number(stats.deathsAnalyzed),
      silverCalculated: Number(stats.silverCalculated)
    })
  } catch (error) {
    console.error('Error updating statistics:', error)
    return NextResponse.json(
      { error: 'Failed to update statistics' },
      { status: 500 }
    )
  }
} 