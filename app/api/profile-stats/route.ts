import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('Fetching statistics...')
    
    // Get or create the statistics record
    const stats = await prisma.grovekeeperStatistics.upsert({
      where: {
        id: 'singleton'
      },
      create: {
        id: 'singleton',
        deathsAnalyzed: BigInt(0),
        silverCalculated: BigInt(0),
        playersTracked: BigInt(0),
        totalPveFame: BigInt(0),
        totalPvpFame: BigInt(0)
      },
      update: {}
    })

    console.log('Statistics fetched successfully:', stats)

    return NextResponse.json({
      // Regear stats
      deathsAnalyzed: Number(stats.deathsAnalyzed),
      silverCalculated: Number(stats.silverCalculated),
      // Profile stats
      playersTracked: Number(stats.playersTracked),
      totalPveFame: Number(stats.totalPveFame),
      totalPvpFame: Number(stats.totalPvpFame)
    })
  } catch (error) {
    console.error('Error fetching statistics:', error)
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
    console.log('Updating statistics...')
    const { 
      // Regear stats
      value, 
      deathsCount,
      // Profile stats
      playersTracked = 0,
      pveFame = 0,
      pvpFame = 0
    } = await request.json()

    // Convert to BigInt and ensure positive values
    const silverValue = BigInt(Math.max(0, Math.floor(value || 0)))
    const deaths = BigInt(Math.max(0, Math.floor(deathsCount || 0)))
    const players = BigInt(Math.max(0, Math.floor(playersTracked)))
    const pve = BigInt(Math.max(0, Math.floor(pveFame)))
    const pvp = BigInt(Math.max(0, Math.floor(pvpFame)))

    console.log('Processing update with values:', { 
      silverValue, deaths, players, pve, pvp 
    })

    // Atomically increment all counters
    const stats = await prisma.grovekeeperStatistics.upsert({
      where: {
        id: 'singleton'
      },
      create: {
        id: 'singleton',
        deathsAnalyzed: deaths,
        silverCalculated: silverValue,
        playersTracked: players,
        totalPveFame: pve,
        totalPvpFame: pvp
      },
      update: {
        deathsAnalyzed: {
          increment: deaths
        },
        silverCalculated: {
          increment: silverValue
        },
        playersTracked: {
          increment: players
        },
        totalPveFame: {
          increment: pve
        },
        totalPvpFame: {
          increment: pvp
        }
      }
    })

    console.log('Statistics updated successfully:', stats)

    return NextResponse.json({
      // Regear stats
      deathsAnalyzed: Number(stats.deathsAnalyzed),
      silverCalculated: Number(stats.silverCalculated),
      // Profile stats
      playersTracked: Number(stats.playersTracked),
      totalPveFame: Number(stats.totalPveFame),
      totalPvpFame: Number(stats.totalPvpFame)
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