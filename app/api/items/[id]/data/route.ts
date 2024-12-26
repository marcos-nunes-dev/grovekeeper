import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Remove enchantment suffix from item ID
    const baseItemId = params.id.split('@')[0]

    const response = await fetch(
      `https://gameinfo.albiononline.com/api/gameinfo/items/${baseItemId}/data`
    )

    if (!response.ok) {
      throw new Error('Failed to fetch item data')
    }

    const data = await response.json()

    if (!data.activeSlots || !data.passiveSlots) {
      throw new Error('Invalid item data structure')
    }

    return NextResponse.json({
      activeSpellSlots: data.activeSpellSlots || 0,
      passiveSpellSlots: data.passiveSpellSlots || 0,
      activeSlots: data.activeSlots,
      passiveSlots: data.passiveSlots,
      twoHanded: data.twoHanded || false
    })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch item data'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
} 