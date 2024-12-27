import { NextResponse } from 'next/server'

interface PlayerData {
  name: string
  battleNumber: number
  totalDeath: number
  totalDamage: string
  totalHealing: string
  totalKillContribution: string
  totalKills: number
  averageIP: number
  totalFame: number
  itemsUsed: string[]
  totalRange: string
  totalSupport: string
  totalTank: string
  totalHealer: string
  totalMelee: string
}

function determineMainClass(player: PlayerData): 'DPS' | 'Tank' | 'Healer' | 'Support' | 'Utility' {
  const roles = {
    tank: parseInt(player.totalTank) || 0,
    healer: parseInt(player.totalHealer) || 0,
    support: parseInt(player.totalSupport) || 0,
    melee: parseInt(player.totalMelee) || 0,
    range: parseInt(player.totalRange) || 0
  }

  type RoleKey = keyof typeof roles

  const maxRole = Object.entries(roles).reduce<RoleKey>((max, [key, value]) => {
    return roles[max] > value ? max : key as RoleKey
  }, 'tank')

  switch (maxRole) {
    case 'tank':
      return 'Tank'
    case 'healer':
      return 'Healer'
    case 'support':
      return 'Support'
    case 'melee':
    case 'range':
      return 'DPS'
    default:
      return 'Utility'
  }
}

export async function POST(request: Request) {
  try {
    const { guildName, playerList, minGP = 20 } = await request.json()

    if (!guildName || !playerList || !Array.isArray(playerList)) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      )
    }

    // Fetch player data from Albion Battles API
    const response = await fetch(
      `https://api.albionbattles.com/player?guildSearch=${encodeURIComponent(guildName)}&interval=28&minGP=${minGP}`,
      { cache: 'no-store' }
    )

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch player data' },
        { status: response.status }
      )
    }

    const data: PlayerData[] = await response.json()

    // Create a map of player data for quick lookup
    const playerDataMap = new Map(data.map(player => [player.name, player]))

    // Calculate average attendance for comparison
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
    console.error('Error processing attendance data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 