import { NextResponse } from 'next/server'

const ALBION_API = 'https://gameinfo.albiononline.com/api/gameinfo'

async function warmUpSearch() {
  try {
    await fetch(`${ALBION_API}/search?q=test`, { cache: 'no-store' })
    return true
  } catch {
    return false
  }
}

async function warmUpGuildMembers() {
  try {
    // Using a known large guild ID for warm-up
    await fetch(`${ALBION_API}/guilds/x7hpqO1-QimtbRrQHG3Kgg/members`, { cache: 'no-store' })
    return true
  } catch {
    return false
  }
}

async function warmUpPlayerInfo() {
  try {
    // Using a known player name for warm-up
    await fetch(`${ALBION_API}/search?q=Shozen`, { cache: 'no-store' })
    return true
  } catch {
    return false
  }
}

export async function GET() {
  try {
    // Run all warm-up requests in parallel
    const [searchWarmed, membersWarmed, playerWarmed] = await Promise.all([
      warmUpSearch(),
      warmUpGuildMembers(),
      warmUpPlayerInfo()
    ])

    return NextResponse.json({
      status: 'completed',
      results: {
        search: searchWarmed ? 'warmed' : 'failed',
        members: membersWarmed ? 'warmed' : 'failed',
        player: playerWarmed ? 'warmed' : 'failed'
      }
    })
  } catch {
    return NextResponse.json(
      { status: 'error', message: 'Failed to warm up APIs' },
      { status: 500 }
    )
  }
} 