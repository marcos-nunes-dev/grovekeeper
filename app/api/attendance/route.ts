import { NextResponse } from 'next/server'
import { withPrisma } from '@/lib/prisma-helper'
import { 
  calculateGuildStatistics, 
  upsertGuildStatistics, 
  getAverageGuildAttendance, 
  getSimilarGuildStats, 
  getBestGuildStats,
  calculatePerformanceScore,
} from '@/lib/services/guild-statistics'

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
  dpsAverageIP: number
  tankAverageIP: number
  healerAverageIP: number
  supportAverageIP: number
  utilityAverageIP: number
  dpsTotalDamage: number
  tankTotalDamage: number
  healerTotalDamage: number
  supportTotalDamage: number
  utilityTotalDamage: number
  dpsTotalHealing: number
  tankTotalHealing: number
  healerTotalHealing: number
  supportTotalHealing: number
  utilityTotalHealing: number
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

function getIPForClass(guild: GuildComparison, playerClass: 'DPS' | 'Tank' | 'Healer' | 'Support' | 'Utility'): number {
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

function getPerformanceForClass(guild: GuildComparison, playerClass: 'DPS' | 'Tank' | 'Healer' | 'Support' | 'Utility'): number {
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

async function fetchPlayerData(guildName: string, playerList: string[], minGP: number): Promise<PlayerData[]> {
  // Add timeout to the fetch request
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000); // 60 second timeout

  try {
    const response = await fetch(
      `https://api.albionbattles.com/player?guildSearch=${encodeURIComponent(guildName)}&interval=28&minGP=${minGP}`,
      { 
        cache: 'no-store',
        signal: controller.signal 
      }
    )

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Failed to fetch player data: ${response.status} ${response.statusText}`)
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
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out while fetching player data')
      }
      throw error
    }
    throw new Error('Unknown error while fetching player data')
  } finally {
    clearTimeout(timeout)
  }
}

export async function POST(request: Request) {
  try {
    const { guildName, playerList, minGP, guildInfo } = await request.json()

    if (!guildName || !playerList || !Array.isArray(playerList)) {
      return NextResponse.json({ error: 'Missing required fields or invalid player list' }, { status: 400 })
    }

    // Fetch player data from the API
    let data: PlayerData[];
    try {
      data = await fetchPlayerData(guildName, playerList, minGP)
    } catch (error) {
      console.error('Error fetching player data:', error)
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to fetch player data' }, { status: 500 })
    }

    // Calculate guild statistics
    const stats = calculateGuildStatistics(guildName, data, guildInfo, minGP)

    // Save statistics to database
    try {
      await upsertGuildStatistics(stats)
    } catch (error) {
      console.error('Error saving guild statistics:', error)
      // Continue execution even if statistics saving fails
    }

    // Use a single withPrisma call for comparison data
    try {
      const dbResults = await withPrisma(async (prisma) => {
        const [avgAttendance, similar, best] = await Promise.allSettled([
          getAverageGuildAttendance(prisma, minGP),
          getSimilarGuildStats(prisma, guildInfo?.memberCount || playerList.length, minGP, guildName),
          getBestGuildStats(prisma, minGP, guildInfo?.memberCount || playerList.length) // Pass guild size for better comparison
        ])

        // Handle the results
        const globalAverageAttendance = avgAttendance.status === 'fulfilled' ? avgAttendance.value : 0
        const similarGuild = similar.status === 'fulfilled' ? similar.value : null
        const bestGuild = best.status === 'fulfilled' ? best.value : null

        // Process player data for response
        const playerDataMap = new Map(data.map(player => [player.name, player]))

        // Process player data with rankings and comparisons
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
              comparison: null,
              totalDamage: 0,
              totalHealing: 0,
              performanceScore: 0
            }
          }

          const mainClass = determineMainClass(playerData)
          const kd = playerData.totalKills / (playerData.totalDeath || 1)

          // Calculate performance scores
          const currentPerformance = mainClass === 'Healer' 
            ? parseFloat(playerData.totalHealing)
            : parseFloat(playerData.totalDamage)

          // Get comparison data for the player's class
          const comparison = {
            current: {
              kd,
              guildName,
              guildSize: guildInfo?.memberCount || playerList.length,
              avgIP: playerData.averageIP,
              performance: currentPerformance,
              performanceScore: calculatePerformanceScore(stats, mainClass)
            },
            similar: similarGuild ? {
              kd: getKdForClass(similarGuild, mainClass),
              guildName: similarGuild.guildName,
              guildSize: similarGuild.guildSize,
              avgIP: getIPForClass(similarGuild, mainClass),
              performance: getPerformanceForClass(similarGuild, mainClass),
              performanceScore: calculatePerformanceScore(similarGuild, mainClass)
            } : null,
            best: bestGuild ? {
              kd: getKdForClass(bestGuild, mainClass),
              guildName: bestGuild.guildName,
              guildSize: bestGuild.guildSize,
              avgIP: getIPForClass(bestGuild, mainClass),
              performance: getPerformanceForClass(bestGuild, mainClass),
              performanceScore: calculatePerformanceScore(bestGuild, mainClass)
            } : null
          }

          const attendancePercentage = globalAverageAttendance > 0 
            ? ((playerData.battleNumber / globalAverageAttendance) * 100) - 100
            : 0

          // Determine tier based on multiple factors
          let tier: 'S' | 'A' | 'B' | 'C'
          const performanceScore = calculatePerformanceScore(stats, mainClass)
          const similarScore = similarGuild ? calculatePerformanceScore(similarGuild, mainClass) : 0
          
          if (playerData.battleNumber >= (globalAverageAttendance * 1.5) && performanceScore > similarScore * 1.2) {
            tier = 'S'
          } else if (playerData.battleNumber >= globalAverageAttendance && performanceScore > similarScore) {
            tier = 'A'
          } else if (playerData.battleNumber >= (globalAverageAttendance * 0.5) && performanceScore > similarScore * 0.8) {
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
            comparison,
            totalDamage: parseFloat(playerData.totalDamage) || 0,
            totalHealing: parseFloat(playerData.totalHealing) || 0,
            performanceScore
          }
        }).sort((a, b) => {
          // Sort by attendance first, then by performance score
          if (b.totalAttendance === a.totalAttendance) {
            return b.performanceScore - a.performanceScore
          }
          return b.totalAttendance - a.totalAttendance
        })

        // Update ranks after sorting
        players.forEach((player, index) => {
          player.rank = index + 1
        })

        return {
          players,
          globalAverageAttendance,
          similarGuild,
          bestGuild,
          stats // Include current guild stats for reference
        }
      })

      return NextResponse.json(dbResults)
    } catch (error) {
      console.error('Database operation error:', error)
      return NextResponse.json({ 
        error: 'Database operation failed',
        players: [],
        globalAverageAttendance: 0,
        similarGuild: null,
        bestGuild: null
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Error processing request:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}

// ... existing fetchPlayerData function 