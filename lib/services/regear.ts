import { RegearResult, GroupRegearResult, KillboardResponse, PricesResponse } from '@/lib/types/regear'
import { formatPrice, isPriceReliable } from '@/lib/utils/price'
import { getFriendlyItemName } from '@/lib/utils/item-names'
import { extractKillIds } from '@/lib/utils/url'

export async function getKillboardData(killboardUrl: string): Promise<RegearResult> {
  // Extract kill ID from URL
  const killId = killboardUrl.split('/').pop()
  if (!killId) throw new Error('Invalid killboard URL')

  // Fetch killboard data from our API route
  const response = await fetch(`/api/killboard/${killId}`)
  if (!response.ok) throw new Error('Failed to fetch killboard data')
  
  const data: KillboardResponse = await response.json()

  // Process equipped items
  const equippedItems = Object.entries(data.Victim.Equipment)
    .filter(([, item]) => item !== null)
    .map(([, item]) => ({
      id: item!.Type,
      name: getFriendlyItemName(item!.Type),
      value: 0,
      formattedValue: '???',
      quality: item!.Quality,
      count: item!.Count,
      isReliablePrice: false,
      priceHistory: [] as Array<{ timestamp: string; price: number }>
    }))

  // Process inventory items
  const bagItems = data.Victim.Inventory
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .map(item => ({
      id: item.Type,
      name: getFriendlyItemName(item.Type),
      value: 0,
      formattedValue: '???',
      quality: item.Quality,
      count: item.Count,
      isReliablePrice: false,
      priceHistory: [] as Array<{ timestamp: string; price: number }>
    }))

  // Fetch prices for all items from our API route
  const allItems = [...equippedItems, ...bagItems]
  const itemIds = allItems.map(item => `${item.id}:${item.quality}`).join(',')
  
  const pricesResponse = await fetch(`/api/prices/v2?items=${itemIds}`)
  if (!pricesResponse.ok) throw new Error('Failed to fetch price data')
  
  const pricesData: PricesResponse = await pricesResponse.json()
  
  // Update items with price data
  equippedItems.forEach(item => {
    const priceData = pricesData[item.id]?.[item.quality]
    if (priceData) {
      item.value = priceData.avg_price
      item.formattedValue = priceData.formatted.avg
      item.isReliablePrice = isPriceReliable(priceData)
      item.priceHistory = priceData.priceHistory || []
    }
  })
  
  bagItems.forEach(item => {
    const priceData = pricesData[item.id]?.[item.quality]
    if (priceData) {
      item.value = priceData.avg_price
      item.formattedValue = priceData.formatted.avg
      item.isReliablePrice = isPriceReliable(priceData)
      item.priceHistory = priceData.priceHistory || []
    }
  })

  // Calculate total
  const totalValue = [...equippedItems, ...bagItems].reduce((sum, item) => sum + (item.value * item.count), 0)

  return {
    equipped: equippedItems,
    bag: bagItems,
    total: {
      value: totalValue,
      formatted: formatPrice(totalValue)
    },
    playerName: data.Victim.Name,
    ip: data.Victim.AverageItemPower,
    location: data.Location
  }
}

export async function getGroupKillboardData(input: string): Promise<GroupRegearResult> {
  const killIds = extractKillIds(input)
  if (killIds.length === 0) {
    throw new Error('No valid killboard URLs found')
  }

  // Process each URL in parallel
  const results = await Promise.all(
    killIds.map(async (killId) => {
      try {
        const result = await getKillboardData(`https://albiononline.com/killboard/kill/${killId}`)
        return { killId, result }
      } catch (error) {
        console.error(`Failed to process kill ID ${killId}:`, error)
        return null
      }
    })
  )

  // Filter out failed results and calculate total
  const validResults = results.filter((r): r is NonNullable<typeof r> => r !== null)
  const totalValue = validResults.reduce((sum, { result }) => sum + result.total.value, 0)

  return {
    results: validResults,
    total: {
      value: totalValue,
      formatted: formatPrice(totalValue)
    }
  }
} 