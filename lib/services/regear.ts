import { RegearResult, KillboardResponse, PricesResponse } from '@/lib/types/regear'
import { formatPrice, isPriceReliable } from '@/lib/utils/price'

const ITEM_NAME_OVERRIDES: Record<string, string> = {
  // Armor pieces
  'HEAD': 'Hood',
  'ARMOR': 'Jacket',
  'SHOES': 'Boots',
  // Weapons
  'MAIN_SPEAR': 'Spear',
  'MAIN_AXE': 'Axe',
  'MAIN_SWORD': 'Sword',
  'MAIN_QUARTERSTAFF': 'Quarterstaff',
  'MAIN_DAGGER': 'Dagger',
  'MAIN_HAMMER': 'Hammer',
  'MAIN_MACE': 'Mace',
  'MAIN_CROSSBOW': 'Crossbow',
  'MAIN_BOW': 'Bow',
  'MAIN_FIRE': 'Fire Staff',
  'MAIN_ARCANE': 'Arcane Staff',
  'MAIN_HOLY': 'Holy Staff',
  'MAIN_NATURE': 'Nature Staff',
  'MAIN_FROST': 'Frost Staff',
  'MAIN_CURSE': 'Curse Staff',
  // Off-hands
  'OFF_SHIELD': 'Shield',
  'OFF_TORCH': 'Torch',
  'OFF_HORN': 'Horn',
  'OFF_TOME': 'Tome',
  // Accessories
  'CAPE': 'Cape',
  'BAG': 'Bag',
  // Consumables
  'POTION_HEAL': 'Healing Potion',
  'POTION_ENERGY': 'Energy Potion',
  'MEAL': 'Food'
}

function formatItemName(itemId: string): string {
  // Extract tier and item type
  const [tierPart, ...nameParts] = itemId.split('_')
  const tier = tierPart.replace('T', '')
  
  // Find the base item type
  let itemName = ''
  for (const [key, value] of Object.entries(ITEM_NAME_OVERRIDES)) {
    if (nameParts.join('_').includes(key)) {
      itemName = value
      break
    }
  }

  // If no override found, use the default formatting
  if (!itemName) {
    itemName = nameParts
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ')
  }

  return `Tier ${tier} ${itemName}`
}

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
      name: formatItemName(item!.Type),
      value: 0,
      formattedValue: '???',
      quality: item!.Quality,
      isReliablePrice: false,
      priceHistory: [] as Array<{ timestamp: string; price: number }>
    }))

  // Process inventory items
  const bagItems = data.Victim.Inventory
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .map(item => ({
      id: item.Type,
      name: formatItemName(item.Type),
      value: 0,
      formattedValue: '???',
      quality: item.Quality,
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
  const totalValue = [...equippedItems, ...bagItems].reduce((sum, item) => sum + item.value, 0)

  return {
    equipped: equippedItems,
    bag: bagItems,
    total: {
      value: totalValue,
      formatted: formatPrice(totalValue)
    }
  }
} 