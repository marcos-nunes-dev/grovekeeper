import { NextResponse } from 'next/server'
import { formatPrice } from '@/lib/utils/price'

interface ItemPrice {
  item_id: string
  city: string
  quality: number
  sell_price_min: number
  sell_price_max: number
}

interface HistoricalDataPoint {
  timestamps: string[]
  prices_avg: number[]
  item_count: number[]
}

interface HistoricalPrice {
  location: string
  item_id: string
  quality: number
  data: HistoricalDataPoint
}

interface ProcessedPrice {
  avg_price: number
  min_price: number
  max_price: number
  formatted: {
    avg: string
    min: string
    max: string
  }
  priceHistory: Array<{
    timestamp: string
    price: number
  }>
}

interface ProcessedPrices {
  [key: string]: {
    [quality: number]: ProcessedPrice | null
  }
}

const VALID_CITIES = ['Bridgewatch', 'Fort Sterling', 'Lymhurst', 'Martlock', 'Thetford']

async function fetchHistoricalPrices(itemId: string, quality: number): Promise<{ prices: ItemPrice[], priceHistory: Array<{ timestamp: string, price: number }> }> {
  const cities = VALID_CITIES.map(city => city.toLowerCase()).join(',')
  const date = new Date()
  const endDate = date.toISOString().split('T')[0]
  date.setDate(date.getDate() - 15) // 15 days ago
  const startDate = date.toISOString().split('T')[0]
  
  const url = `https://west.albion-online-data.com/api/v2/stats/charts/${itemId}?date=${startDate}&end_date=${endDate}&locations=${cities}&qualities=${quality}`

  try {
    const response = await fetch(url)
    if (!response.ok) {
      console.error(`Failed to fetch historical prices: ${response.statusText}`)
      return { prices: [], priceHistory: [] }
    }
    const data: HistoricalPrice[] = await response.json()
    
    // Convert historical data to ItemPrice format for current prices
    const prices = data.flatMap(cityData => {
      const lastIndex = cityData.data.prices_avg.length - 1
      if (lastIndex < 0) return []
      
      return [{
        item_id: itemId,
        city: cityData.location,
        quality: quality,
        sell_price_min: cityData.data.prices_avg[lastIndex],
        sell_price_max: 0 // We don't use max price anymore
      }]
    }).filter(price => price.sell_price_min > 0)

    // Process historical data for the chart
    // Combine data from all cities and calculate average for each timestamp
    const timestampMap = new Map<string, number[]>()
    data.forEach(cityData => {
      cityData.data.timestamps.forEach((timestamp, index) => {
        const price = cityData.data.prices_avg[index]
        if (price > 0) { // Only include non-zero prices
          const prices = timestampMap.get(timestamp) || []
          prices.push(price)
          timestampMap.set(timestamp, prices)
        }
      })
    })

    // Calculate average price for each timestamp
    const priceHistory = Array.from(timestampMap.entries())
      .map(([timestamp, prices]) => ({
        timestamp,
        price: prices.reduce((sum, price) => sum + price, 0) / prices.length
      }))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

    return { prices, priceHistory }
  } catch (error) {
    console.error(`Error fetching historical prices:`, error)
    return { prices: [], priceHistory: [] }
  }
}

async function fetchPricesForItems(items: Array<{ id: string, qualities: number[] }>): Promise<ItemPrice[]> {
  const baseUrl = 'https://west.albion-online-data.com/api/v2/stats/prices/'
  const allPrices: ItemPrice[] = []

  // Batch items together to minimize API calls
  const batchSize = 10 // Adjust based on API limits and URL length constraints
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    const itemIds = batch.map(item => item.id).join(',')
    const qualities = Array.from(new Set(batch.flatMap(item => item.qualities))).join(',')
    
    const url = `${baseUrl}${itemIds}?qualities=${qualities}`

    try {
      const response = await fetch(url)
      if (!response.ok) {
        console.error(`Failed to fetch prices for batch: ${response.statusText}`)
        continue
      }
      const data: ItemPrice[] = await response.json()
      allPrices.push(...data)
    } catch (error) {
      console.error(`Error fetching prices for batch:`, error)
    }
  }

  return allPrices
}

async function calculateAveragePrice(prices: ItemPrice[], itemId: string, quality: number): Promise<ProcessedPrice | null> {
  // Filter out invalid cities and only use sell_price_min (sell orders)
  const validPrices = prices
    .filter(price => VALID_CITIES.includes(price.city))
    .map(price => price.sell_price_min)
    .filter(price => price > 0) // Filter out zero prices

  // If no current prices available, try historical data
  if (validPrices.length === 0) {
    const { prices: historicalPrices, priceHistory } = await fetchHistoricalPrices(itemId, quality)
    const historicalValidPrices = historicalPrices
      .filter(price => VALID_CITIES.includes(price.city))
      .map(price => price.sell_price_min)
      .filter(price => price > 0)

    if (historicalValidPrices.length === 0) {
      return null
    }

    const avgPrice = historicalValidPrices.reduce((sum, price) => sum + price, 0) / historicalValidPrices.length
    const minPrice = Math.min(...historicalValidPrices)
    const maxPrice = Math.max(...historicalValidPrices)

    return {
      avg_price: avgPrice,
      min_price: minPrice,
      max_price: maxPrice,
      formatted: {
        avg: formatPrice(avgPrice),
        min: formatPrice(minPrice),
        max: formatPrice(maxPrice)
      },
      priceHistory
    }
  }

  // Get historical data for the chart even when we have current prices
  const { priceHistory } = await fetchHistoricalPrices(itemId, quality)

  const avgPrice = validPrices.reduce((sum, price) => sum + price, 0) / validPrices.length
  const minPrice = Math.min(...validPrices)
  const maxPrice = Math.max(...validPrices)

  return {
    avg_price: avgPrice,
    min_price: minPrice,
    max_price: maxPrice,
    formatted: {
      avg: formatPrice(avgPrice),
      min: formatPrice(minPrice),
      max: formatPrice(maxPrice)
    },
    priceHistory
  }
}

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const itemsParam = searchParams.get('items')

    if (!itemsParam) {
      return new NextResponse(
        JSON.stringify({ error: 'Items parameter is required' }),
        { status: 400 }
      )
    }

    // Parse the items parameter which should include quality information
    // Format: itemId:quality,itemId:quality,...
    const items = itemsParam.split(',').reduce<Array<{ id: string, qualities: number[] }>>((acc, item) => {
      const [itemId, quality] = item.split(':')
      const existingItem = acc.find(i => i.id === itemId)
      
      if (existingItem) {
        existingItem.qualities.push(Number(quality))
      } else {
        acc.push({ id: itemId, qualities: [Number(quality)] })
      }
      
      return acc
    }, [])

    const allPrices = await fetchPricesForItems(items)

    // Process prices by item and quality
    const processedPrices = await Promise.all(
      items.flatMap(item => 
        item.qualities.map(async quality => {
          const itemPricesForQuality = allPrices.filter(
            p => p.item_id === item.id && p.quality === quality
          )

          const priceData = await calculateAveragePrice(itemPricesForQuality, item.id, quality)

          return {
            itemId: item.id,
            quality,
            priceData
          }
        })
      )
    )

    // Convert to the expected response format
    const result = processedPrices.reduce<ProcessedPrices>((acc, { itemId, quality, priceData }) => {
      if (!acc[itemId]) {
        acc[itemId] = {}
      }
      acc[itemId][quality] = priceData
      return acc
    }, {})

    return NextResponse.json(result)
  } catch (error: unknown) {
    console.error('Error processing price data:', error)
    return new NextResponse(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500 }
    )
  }
} 