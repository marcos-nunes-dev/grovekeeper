import { NextResponse } from 'next/server'

interface GuildMember {
  Name: string
  Id: string
  GuildName: string
  GuildId: string
  AllianceName: string | null
  AllianceId: string
  KillFame: number
  DeathFame: number
  FameRatio: number
  LifetimeStatistics: {
    PvE: {
      Total: number
      Royal: number
      Outlands: number
      Avalon: number
      Hellgate: number
      CorruptedDungeon: number
      Mists: number
    }
    Gathering: {
      All: {
        Total: number
        Royal: number
        Outlands: number
        Avalon: number
      }
    }
    Crafting: {
      Total: number
      Royal: number
      Outlands: number
      Avalon: number
    }
    CrystalLeague: number
    FishingFame: number
    FarmingFame: number
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const response = await fetch(
      `https://gameinfo.albiononline.com/api/gameinfo/guilds/${params.id}/members`,
      { cache: 'no-store' }
    )

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch guild members data' },
        { status: response.status }
      )
    }

    const members: GuildMember[] = await response.json()

    // Calculate guild statistics
    const totalKillFame = members.reduce((sum, member) => sum + member.KillFame, 0)
    const totalDeathFame = members.reduce((sum, member) => sum + member.DeathFame, 0)
    const totalPvEFame = members.reduce((sum, member) => sum + member.LifetimeStatistics.PvE.Total, 0)
    const totalGatheringFame = members.reduce((sum, member) => sum + member.LifetimeStatistics.Gathering.All.Total, 0)
    const totalCraftingFame = members.reduce((sum, member) => sum + member.LifetimeStatistics.Crafting.Total, 0)

    return NextResponse.json({
      members,
      statistics: {
        memberCount: members.length,
        totalKillFame,
        totalDeathFame,
        totalPvEFame,
        totalGatheringFame,
        totalCraftingFame,
        averageKillFame: Math.round(totalKillFame / members.length),
        averageDeathFame: Math.round(totalDeathFame / members.length),
        averagePvEFame: Math.round(totalPvEFame / members.length),
      }
    })
  } catch (error) {
    console.error('Error fetching guild members:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 