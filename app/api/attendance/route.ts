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

interface GuildComparison {
  guildName: string
  guildSize: number
  killFame: number
  dpsKillDeathRatio: number
  tankKillDeathRatio: number
  healerKillDeathRatio: number
  supportKillDeathRatio: number
  utilityKillDeathRatio: number
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

async function getAverageGuildAttendance(minGP: number): Promise<number> {
  try {
    // Get the current month
    const now = new Date()
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Get statistics from all guilds for the current month and minGP
    const stats = await prisma.guildStatistics.findMany({
      where: {
        month: currentMonth,
        minGP: minGP,
      },
      select: {
        averageAttendance: true
      }
    })

    if (!stats || stats.length === 0) return 0

    // Calculate the average attendance across all guilds with the same minGP
    const totalAttendance = stats.reduce((sum, stat) => sum + stat.averageAttendance, 0)
    return totalAttendance / stats.length
  } catch (error) {
    console.error('Error getting average guild attendance:', error)
    return 0
  }
}

async function getSimilarGuildStats(guildSize: number, minGP: number, guildName: string): Promise<GuildComparison | null> {
  try {
    const now = new Date()
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Find a guild with similar size (±20% of current guild size)
    const similarGuild = await prisma.guildStatistics.findFirst({
      where: {
        month: currentMonth,
        minGP,
        guildSize: {
          gte: guildSize * 0.8,
          lte: guildSize * 1.2,
        },
        NOT: {
          guildName: {
            mode: 'insensitive',
            equals: guildName
          }
        }
      },
      orderBy: {
        killFame: 'desc' // Get the best performing similar-sized guild
      }
    })

    return similarGuild
  } catch (error) {
    console.error('Error getting similar guild stats:', error)
    return null
  }
}

async function getBestGuildStats(minGP: number): Promise<GuildComparison | null> {
  try {
    const now = new Date()
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Find the guild with highest kill fame
    const bestGuild = await prisma.guildStatistics.findFirst({
      where: {
        month: currentMonth,
        minGP,
      },
      orderBy: {
        killFame: 'desc'
      }
    })

    return bestGuild
  } catch (error) {
    console.error('Error getting best guild stats:', error)
    return null
  }
}

export async function POST(request: Request) {
  try {
    const { guildName, playerList, minGP, guildInfo } = await request.json()

    if (!guildName || !playerList || !Array.isArray(playerList)) {
      return NextResponse.json({ error: 'Missing required fields or invalid player list' }, { status: 400 })
    }

    // Fetch player data from the API
    const data = await fetchPlayerData(guildName, playerList, minGP)

    // Get average attendance across all guilds
    const globalAverageAttendance = await getAverageGuildAttendance(minGP)

    // Get comparison guild statistics
    const guildSize = guildInfo?.memberCount || playerList.length
    const [similarGuild, bestGuild] = await Promise.all([
      getSimilarGuildStats(guildSize, minGP, guildName),
      getBestGuildStats(minGP)
    ])

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
        guildName: {
          mode: 'insensitive',
          equals: guildName
        },
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
          topWeapons: [],
          comparison: null
        }
      }

      const mainClass = determineMainClass(playerData)
      const kd = playerData.totalKills / (playerData.totalDeath || 1)

      // Get comparison data for the player's class
      const comparison = {
        current: {
          kd,
          guildName,
          guildSize
        },
        similar: similarGuild ? {
          kd: getKdForClass(similarGuild, mainClass),
          guildName: similarGuild.guildName,
          guildSize: similarGuild.guildSize
        } : null,
        best: bestGuild ? {
          kd: getKdForClass(bestGuild, mainClass),
          guildName: bestGuild.guildName,
          guildSize: bestGuild.guildSize
        } : null
      }

      const attendancePercentage = (playerData.battleNumber / averageAttendance) * 100 - 100
      const globalAttendancePercentage = globalAverageAttendance > 0 
        ? (playerData.battleNumber / globalAverageAttendance) * 100
        : playerData.battleNumber * 100

      // Determine tier based on global comparison
      let tier: 'S' | 'A' | 'B' | 'C'
      if (globalAttendancePercentage >= 150) {
        tier = 'S'
      } else if (globalAttendancePercentage >= 100) {
        tier = 'A'
      } else if (globalAttendancePercentage >= 50) {
        tier = 'B'
      } else {
        tier = 'C'
      }

      return {
        rank: index + 1,
        name,
        mainClass,
        tier,
        totalKills: playerData.totalKills,
        totalDeaths: playerData.totalDeath,
        avgIP: Math.round(playerData.averageIP),
        totalAttendance: playerData.battleNumber,
        attendanceComparison: Math.round(attendancePercentage),
        topWeapons: Array.isArray(playerData.itemsUsed) ? playerData.itemsUsed.slice(0, 3) : [],
        comparison
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

function getKdForClass(guild: GuildComparison, playerClass: 'DPS' | 'Tank' | 'Healer' | 'Support' | 'Utility'): number {
  switch (playerClass) {
    case 'DPS':
      return guild.dpsKillDeathRatio
    case 'Tank':
      return guild.tankKillDeathRatio
    case 'Healer':
      return guild.healerKillDeathRatio
    case 'Support':
      return guild.supportKillDeathRatio
    case 'Utility':
      return guild.utilityKillDeathRatio
  }
} 