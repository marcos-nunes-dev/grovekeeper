import { PrismaClient } from '@prisma/client'
import { withPrisma } from '@/lib/prisma-helper'

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

export interface GuildStatisticsData {
  guildName: string
  guildSize: number
  killFame: number
  deathFame: number
  averageAttendance: number
  minGP: number
  
  // Kill/Death ratios
  dpsKillDeathRatio: number
  tankKillDeathRatio: number
  healerKillDeathRatio: number
  supportKillDeathRatio: number
  utilityKillDeathRatio: number

  // Average IP
  dpsAverageIP: number
  tankAverageIP: number
  healerAverageIP: number
  supportAverageIP: number
  utilityAverageIP: number

  // Kill Contribution
  dpsKillContribution: number
  tankKillContribution: number
  healerKillContribution: number
  supportKillContribution: number
  utilityKillContribution: number

  // Total Damage
  dpsTotalDamage: number
  tankTotalDamage: number
  healerTotalDamage: number
  supportTotalDamage: number
  utilityTotalDamage: number

  // Total Healing
  dpsTotalHealing: number
  tankTotalHealing: number
  healerTotalHealing: number
  supportTotalHealing: number
  utilityTotalHealing: number

  // Total Fame
  dpsTotalFame: number
  tankTotalFame: number
  healerTotalFame: number
  supportTotalFame: number
  utilityTotalFame: number
}

// Helper functions for guild comparisons
function getKdForClass(guild: GuildStatisticsData, playerClass: 'DPS' | 'Tank' | 'Healer' | 'Support' | 'Utility'): number {
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

function getIPForClass(guild: GuildStatisticsData, playerClass: 'DPS' | 'Tank' | 'Healer' | 'Support' | 'Utility'): number {
  switch (playerClass) {
    case 'DPS':
      return guild.dpsAverageIP
    case 'Tank':
      return guild.tankAverageIP
    case 'Healer':
      return guild.healerAverageIP
    case 'Support':
      return guild.supportAverageIP
    case 'Utility':
      return guild.utilityAverageIP
  }
}

function getPerformanceForClass(guild: GuildStatisticsData, playerClass: 'DPS' | 'Tank' | 'Healer' | 'Support' | 'Utility'): number {
  switch (playerClass) {
    case 'DPS':
      return guild.dpsTotalDamage
    case 'Tank':
      return guild.tankTotalDamage
    case 'Healer':
      return guild.healerTotalHealing
    case 'Support':
      return guild.supportTotalDamage
    case 'Utility':
      return guild.utilityTotalDamage
  }
}

function calculateAverage(players: PlayerData[], getValue: (player: PlayerData) => number): number {
  if (players.length === 0) return 0
  return players.reduce((sum, player) => sum + getValue(player), 0) / players.length
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

export function calculateGuildStatistics(
  guildName: string,
  playerData: PlayerData[],
  guildInfo: { memberCount: number; killFame: number; deathFame: number } | null,
  minGP: number
): GuildStatisticsData {
  // Group players by their main class
  const playersByClass = playerData.reduce((acc, player) => {
    const mainClass = determineMainClass(player)
    if (!acc[mainClass]) acc[mainClass] = []
    acc[mainClass].push(player)
    return acc
  }, {} as Record<string, PlayerData[]>)

  return {
    guildName,
    guildSize: guildInfo?.memberCount || playerData.length,
    killFame: guildInfo?.killFame || 0,
    deathFame: guildInfo?.deathFame || 0,
    minGP,
    averageAttendance: playerData.reduce((sum, p) => sum + p.battleNumber, 0) / playerData.length,

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
}

export async function upsertGuildStatistics(stats: GuildStatisticsData) {
  const currentMonth = new Date()
  currentMonth.setDate(1) // Set to first day of the month
  currentMonth.setHours(0, 0, 0, 0)

  return withPrisma(async (prisma) => {
    // First, find any existing stats for this guild
    const existingStats = await prisma.guildStatistics.findFirst({
      where: {
        guildName: {
          mode: 'insensitive',
          equals: stats.guildName
        },
        minGP: stats.minGP,
      },
      orderBy: {
        month: 'desc'
      }
    })

    if (existingStats) {
      const existingMonth = new Date(existingStats.month)
      const isSameMonth = existingMonth.getMonth() === currentMonth.getMonth() && 
                         existingMonth.getFullYear() === currentMonth.getFullYear()

      if (isSameMonth) {
        // Update existing record for current month
        return prisma.guildStatistics.update({
          where: { id: existingStats.id },
          data: {
            ...stats,
            month: currentMonth,
            updatedAt: new Date()
          }
        })
      }
    }

    // Create new record for new month
    return prisma.guildStatistics.create({
      data: {
        ...stats,
        month: currentMonth,
      }
    })
  })
}

export async function getAverageGuildAttendance(prisma: PrismaClient, minGP: number): Promise<number> {
  const result = await prisma.guildStatistics.aggregate({
    where: {
      minGP,
      month: {
        gte: new Date(new Date().setDate(1)) // Current month
      }
    },
    _avg: {
      averageAttendance: true
    }
  })

  return result._avg.averageAttendance || 0
}

interface GuildStatisticsWhere {
  minGP: number
  month: Date
  averageAttendance: { gt: number }
  killFame: { gt: number }
  guildSize?: {
    gte: number
    lte: number
  }
  guildName?: {
    not: string
  }
}

export async function getSimilarGuildStats(
  prisma: PrismaClient,
  guildSize: number,
  minGP: number,
  excludeGuildName: string
) {
  const sizeRange = {
    min: guildSize * 0.8,
    max: guildSize * 1.2
  }

  const currentMonth = new Date()
  currentMonth.setDate(1)
  currentMonth.setHours(0, 0, 0, 0)

  // Find guilds with similar size and good activity
  return prisma.guildStatistics.findFirst({
    where: {
      guildSize: {
        gte: sizeRange.min,
        lte: sizeRange.max
      },
      minGP,
      guildName: {
        not: excludeGuildName
      },
      month: currentMonth,
      // Ensure minimum activity
      averageAttendance: {
        gt: 0
      },
      killFame: {
        gt: 0
      }
    },
    orderBy: [
      // Order by a combination of metrics
      { killFame: 'desc' },
      { averageAttendance: 'desc' }
    ]
  })
}

export async function getBestGuildStats(
  prisma: PrismaClient,
  minGP: number,
  guildSize?: number // Optional: to find best guild of similar size
) {
  const currentMonth = new Date()
  currentMonth.setDate(1)
  currentMonth.setHours(0, 0, 0, 0)

  const whereClause: GuildStatisticsWhere = {
    minGP,
    month: currentMonth,
    // Ensure minimum activity
    averageAttendance: {
      gt: 0
    },
    killFame: {
      gt: 0
    }
  }

  // If guildSize is provided, find best guild of similar size
  if (guildSize) {
    whereClause.guildSize = {
      gte: guildSize * 0.5,  // Allow for larger range when looking for best guild
      lte: guildSize * 2
    }
  }

  return prisma.guildStatistics.findFirst({
    where: whereClause,
    orderBy: [
      // Order by multiple metrics to find truly "best" guild
      { killFame: 'desc' },
      { averageAttendance: 'desc' },
      { guildSize: 'desc' }
    ]
  })
}

// Helper to calculate performance score
export function calculatePerformanceScore(guild: GuildStatisticsData, playerClass: 'DPS' | 'Tank' | 'Healer' | 'Support' | 'Utility'): number {
  const basePerformance = getPerformanceForClass(guild, playerClass)
  const kd = getKdForClass(guild, playerClass)
  const avgIP = getIPForClass(guild, playerClass)

  // Normalize values based on class expectations
  const normalizedPerformance = basePerformance / (guild.guildSize || 1)
  const ipFactor = avgIP / 1200 // Assuming 1200 IP is a baseline
  const kdFactor = Math.min(kd, 5) / 2 // Cap KD ratio influence, assuming 2.5 is a good baseline

  switch (playerClass) {
    case 'DPS':
      return normalizedPerformance * kdFactor * ipFactor
    case 'Tank':
      return normalizedPerformance * (kdFactor * 0.5 + 0.5) * ipFactor // KD matters less for tanks
    case 'Healer':
      return normalizedPerformance * ipFactor // KD doesn't matter for healers
    case 'Support':
      return normalizedPerformance * (kdFactor * 0.3 + 0.7) * ipFactor // KD matters little for support
    case 'Utility':
      return normalizedPerformance * kdFactor * ipFactor
  }
} 