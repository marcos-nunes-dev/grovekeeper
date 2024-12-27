import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface PlayerData {
  name: string
  mainClass: 'DPS' | 'Tank' | 'Healer' | 'Support' | 'Utility'
  battleNumber: number
  totalKills: number
  totalDeath: number
  killDeathRatio: number
  averageIP: number
  totalKillContribution: string
  totalDamage: string
  totalHealing: string
  totalFame: number
  totalTank: string
  totalHealer: string
  totalSupport: string
  totalMelee: string
  totalRange: string
  itemsUsed: string[]
}

async function fetchPlayerData(guildName: string, playerList: string[], minGP: number): Promise<PlayerData[]> {
  // Fetch player data from Albion Battles API
  const response = await fetch(
    `https://api.albionbattles.com/player?guildSearch=${encodeURIComponent(guildName)}&interval=28&minGP=${minGP}`,
    { cache: 'no-store' }
  )

  if (!response.ok) {
    throw new Error('Failed to fetch player data')
  }

  const data: PlayerData[] = await response.json()

  // Create a map of player data for quick lookup
  const playerDataMap = new Map(data.map(player => [player.name, player]))

  // Process player data
  return playerList.map(name => {
    const playerData = playerDataMap.get(name)

    if (!playerData) {
      return {
        name,
        mainClass: 'Utility' as const,
        battleNumber: 0,
        totalKills: 0,
        totalDeath: 0,
        killDeathRatio: 0,
        averageIP: 0,
        totalKillContribution: '0',
        totalDamage: '0',
        totalHealing: '0',
        totalFame: 0,
        totalTank: '0',
        totalHealer: '0',
        totalSupport: '0',
        totalMelee: '0',
        totalRange: '0',
        itemsUsed: []
      }
    }

    return playerData
  })
}

function determineMainClass(player: PlayerData): 'DPS' | 'Tank' | 'Healer' | 'Support' | 'Utility' {
  const totalTank = parseFloat(player.totalTank) || 0
  const totalHealer = parseFloat(player.totalHealer) || 0
  const totalSupport = parseFloat(player.totalSupport) || 0
  const totalMelee = parseFloat(player.totalMelee) || 0
  const totalRange = parseFloat(player.totalRange) || 0

  const roles = [
    { role: 'Tank', value: totalTank },
    { role: 'Healer', value: totalHealer },
    { role: 'Support', value: totalSupport },
    { role: 'DPS', value: Math.max(totalMelee, totalRange) },
    { role: 'Utility', value: 0 } // Default role if no other role has significant value
  ]

  const mainRole = roles.reduce((prev, curr) => 
    curr.value > prev.value ? curr : prev
  )

  return mainRole.role as 'DPS' | 'Tank' | 'Healer' | 'Support' | 'Utility'
}

function calculateAverage(players: PlayerData[], getValue: (player: PlayerData) => number): number {
  if (players.length === 0) return 0
  return players.reduce((sum, player) => sum + getValue(player), 0) / players.length
}

function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
}

function isSameWeek(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    getWeekNumber(date1) === getWeekNumber(date2)
  )
}

export async function POST(request: Request) {
  try {
    const { guildName, playerList, minGP, guildInfo } = await request.json()

    if (!guildName || !playerList || !Array.isArray(playerList)) {
      return NextResponse.json({ error: 'Missing required fields or invalid player list' }, { status: 400 })
    }

    // Fetch player data from the API
    const data = await fetchPlayerData(guildName, playerList, minGP)

    // Group players by class for statistics
    const playersByClass = data.reduce((acc, player) => {
      const mainClass = determineMainClass(player)
      if (!acc[mainClass]) acc[mainClass] = []
      acc[mainClass].push(player)
      return acc
    }, {} as Record<string, PlayerData[]>)

    // Calculate statistics using the data we have
    const stats = {
      guildSize: guildInfo?.memberCount || playerList.length,
      killFame: guildInfo?.killFame || 0,
      deathFame: guildInfo?.deathFame || 0,
      averageAttendance: data.reduce((sum, p) => sum + p.battleNumber, 0) / data.length,
      
      // Kill/Death ratios
      dpsKillDeathRatio: calculateAverage(playersByClass['DPS'] || [], p => p.totalKills / (p.totalDeath || 1)),
      tankKillDeathRatio: calculateAverage(playersByClass['Tank'] || [], p => p.totalKills / (p.totalDeath || 1)),
      healerKillDeathRatio: calculateAverage(playersByClass['Healer'] || [], p => p.totalKills / (p.totalDeath || 1)),
      supportKillDeathRatio: calculateAverage(playersByClass['Support'] || [], p => p.totalKills / (p.totalDeath || 1)),
      utilityKillDeathRatio: calculateAverage(playersByClass['Utility'] || [], p => p.totalKills / (p.totalDeath || 1)),

      // Average IP
      dpsAverageIP: calculateAverage(playersByClass['DPS'] || [], p => p.averageIP),
      tankAverageIP: calculateAverage(playersByClass['Tank'] || [], p => p.averageIP),
      healerAverageIP: calculateAverage(playersByClass['Healer'] || [], p => p.averageIP),
      supportAverageIP: calculateAverage(playersByClass['Support'] || [], p => p.averageIP),
      utilityAverageIP: calculateAverage(playersByClass['Utility'] || [], p => p.averageIP),

      // Kill Contribution
      dpsKillContribution: calculateAverage(playersByClass['DPS'] || [], p => parseFloat(p.totalKillContribution) || 0),
      tankKillContribution: calculateAverage(playersByClass['Tank'] || [], p => parseFloat(p.totalKillContribution) || 0),
      healerKillContribution: calculateAverage(playersByClass['Healer'] || [], p => parseFloat(p.totalKillContribution) || 0),
      supportKillContribution: calculateAverage(playersByClass['Support'] || [], p => parseFloat(p.totalKillContribution) || 0),
      utilityKillContribution: calculateAverage(playersByClass['Utility'] || [], p => parseFloat(p.totalKillContribution) || 0),

      // Total Damage
      dpsTotalDamage: calculateAverage(playersByClass['DPS'] || [], p => parseFloat(p.totalDamage) || 0),
      tankTotalDamage: calculateAverage(playersByClass['Tank'] || [], p => parseFloat(p.totalDamage) || 0),
      healerTotalDamage: calculateAverage(playersByClass['Healer'] || [], p => parseFloat(p.totalDamage) || 0),
      supportTotalDamage: calculateAverage(playersByClass['Support'] || [], p => parseFloat(p.totalDamage) || 0),
      utilityTotalDamage: calculateAverage(playersByClass['Utility'] || [], p => parseFloat(p.totalDamage) || 0),

      // Total Healing
      dpsTotalHealing: calculateAverage(playersByClass['DPS'] || [], p => parseFloat(p.totalHealing) || 0),
      tankTotalHealing: calculateAverage(playersByClass['Tank'] || [], p => parseFloat(p.totalHealing) || 0),
      healerTotalHealing: calculateAverage(playersByClass['Healer'] || [], p => parseFloat(p.totalHealing) || 0),
      supportTotalHealing: calculateAverage(playersByClass['Support'] || [], p => parseFloat(p.totalHealing) || 0),
      utilityTotalHealing: calculateAverage(playersByClass['Utility'] || [], p => parseFloat(p.totalHealing) || 0),

      // Total Fame
      dpsTotalFame: calculateAverage(playersByClass['DPS'] || [], p => p.totalFame),
      tankTotalFame: calculateAverage(playersByClass['Tank'] || [], p => p.totalFame),
      healerTotalFame: calculateAverage(playersByClass['Healer'] || [], p => p.totalFame),
      supportTotalFame: calculateAverage(playersByClass['Support'] || [], p => p.totalFame),
      utilityTotalFame: calculateAverage(playersByClass['Utility'] || [], p => p.totalFame),
    }

    // Get the current date
    const now = new Date()
    // Set to first day of the month
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Check if we already have statistics for this guild and minGP this month
    const existingStats = await prisma.guildStatistics.findFirst({
      where: {
        guildName,
        minGP,
        month: currentMonth,
      },
      orderBy: {
        month: 'desc'
      }
    })

    if (existingStats) {
      // If we have stats this month, check if they're from the same week
      if (isSameWeek(existingStats.updatedAt, now)) {
        // Skip update if it's the same week
        console.log('Stats already exist for this week, skipping update')
      } else {
        // Update stats if it's a different week in the same month
        await prisma.guildStatistics.update({
          where: {
            id: existingStats.id
          },
          data: {
            ...stats,
            updatedAt: now
          }
        })
      }
    } else {
      // Create new stats if we don't have any for this month
      await prisma.guildStatistics.create({
        data: {
          guildName,
          month: currentMonth,
          minGP,
          ...stats,
          updatedAt: now
        }
      })
    }

    // Process player data for response
    const playerDataMap = new Map(data.map(player => [player.name, player]))
    const totalBattles = data.reduce((sum, player) => sum + player.battleNumber, 0)
    const averageAttendance = totalBattles / data.length || 0

    // Process player data
    const players = playerList.map((name, index) => {
      const playerData = playerDataMap.get(name)

      if (!playerData) {
        return {
          rank: index + 1,
          name,
          mainClass: 'Utility' as const,
          tier: 'C' as const,
          totalKills: 0,
          totalDeaths: 0,
          avgIP: 0,
          totalAttendance: 0,
          attendanceComparison: -100,
          topWeapons: []
        }
      }

      const attendancePercentage = (playerData.battleNumber / averageAttendance) * 100 - 100

      return {
        rank: index + 1,
        name,
        mainClass: determineMainClass(playerData),
        tier: playerData.battleNumber > 15 ? 'S' as const : 
              playerData.battleNumber > 10 ? 'A' as const : 
              playerData.battleNumber > 5 ? 'B' as const : 'C' as const,
        totalKills: playerData.totalKills,
        totalDeaths: playerData.totalDeath,
        avgIP: Math.round(playerData.averageIP),
        totalAttendance: playerData.battleNumber,
        attendanceComparison: Math.round(attendancePercentage),
        topWeapons: playerData.itemsUsed.slice(0, 3)
      }
    }).sort((a, b) => b.totalAttendance - a.totalAttendance)

    // Update ranks after sorting
    players.forEach((player, index) => {
      player.rank = index + 1
    })

    return NextResponse.json({ players })
  } catch (error) {
    console.error('Error processing request:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
} 