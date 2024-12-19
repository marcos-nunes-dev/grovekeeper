import { RegearResult, KillboardResponse, PricesResponse } from '@/lib/types/regear'
import { formatPrice, isPriceReliable } from '@/lib/utils/price'
import { getFriendlyItemName } from '@/lib/utils/item-names'

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
  const itemIds = allItems.map(item => item.id).join(',')
  
  const pricesResponse = await fetch(`/api/prices?items=${itemIds}`)
  if (!pricesResponse.ok) throw new Error('Failed to fetch price data')
  
  const pricesData: PricesResponse = await pricesResponse.json()
  
  // Update items with price data
  equippedItems.forEach(item => {
    const priceData = pricesData[item.id]
    if (priceData) {
      item.value = priceData.avg_price
      item.formattedValue = priceData.formatted.avg
      item.isReliablePrice = isPriceReliable(priceData)
      item.priceHistory = priceData.data.map(point => ({
        timestamp: point.timestamp,
        price: point.avg_price
      }))
    }
  })
  
  bagItems.forEach(item => {
    const priceData = pricesData[item.id]
    if (priceData) {
      item.value = priceData.avg_price
      item.formattedValue = priceData.formatted.avg
      item.isReliablePrice = isPriceReliable(priceData)
      item.priceHistory = priceData.data.map(point => ({
        timestamp: point.timestamp,
        price: point.avg_price
      }))
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
    }
  }
} 