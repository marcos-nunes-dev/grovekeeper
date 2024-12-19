import { NextResponse } from 'next/server'
import { formatPrice } from '@/lib/utils/price'

interface HistoricalDataPoint {
  timestamp: string
  avg_price: number
  item_count: number
}

interface PriceHistoryResponse {
  item_id: string
  location: string
  quality: number
  data: HistoricalDataPoint[]
}

interface ProcessedPrice {
  avg_price: number
  min_price: number
  max_price: number
  data: Array<{
    timestamp: string
    avg_price: number
  }>
  formatted: {
    avg: string
    min: string
    max: string
  }
}

interface ProcessedPrices {
  [key: string]: ProcessedPrice | null
}

async function fetchPricesForSubset(items: string[]): Promise<PriceHistoryResponse[]> {
  const baseUrl = 'https://west.albion-online-data.com/api/v2/stats/history/'
  const timeScale = '?time-scale=24'
  const url = `${baseUrl}${items.join(',')}${timeScale}`

  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error('Failed to fetch price data')
    }
    const data: PriceHistoryResponse[] = await response.json()
    return data
  } catch (error) {
    console.error('Failed to fetch item prices:', error)
    return []
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const items = searchParams.get('items')
    
    if (!items) {
      return new NextResponse(
        JSON.stringify({ error: 'Items parameter is required' }),
        { status: 400 }
      )
    }

    const itemList = items.split(',')
    const maxUrlLength = 2000
    const baseUrl = 'https://west.albion-online-data.com/api/v2/stats/history/'
    const timeScale = '?time-scale=24'
    let currentSubset: string[] = []
    let currentUrlLength = baseUrl.length + timeScale.length
    let allPrices: PriceHistoryResponse[] = []

    // Split items into subsets to avoid URL length limits
    for (const item of itemList) {
      const newUrlLength = currentUrlLength + item.length + 1
      if (newUrlLength > maxUrlLength) {
        const subsetPrices = await fetchPricesForSubset(currentSubset)
        allPrices = [...allPrices, ...subsetPrices]
        currentSubset = []
        currentUrlLength = baseUrl.length + timeScale.length
      }
      currentSubset.push(item)
      currentUrlLength += item.length + 1
    }

    if (currentSubset.length > 0) {
      const subsetPrices = await fetchPricesForSubset(currentSubset)
      allPrices = [...allPrices, ...subsetPrices]
    }

    // Process and format prices
    const processedPrices = allPrices.reduce<ProcessedPrices>((acc, price) => {
      if (price.data && price.data.length > 0) {
        const avgPrice = price.data.reduce((sum, dataPoint) => sum + dataPoint.avg_price, 0) / price.data.length
        const minPrice = Math.min(...price.data.map(dataPoint => dataPoint.avg_price))
        const maxPrice = Math.max(...price.data.map(dataPoint => dataPoint.avg_price))

        acc[price.item_id] = {
          avg_price: avgPrice,
          min_price: minPrice,
          max_price: maxPrice,
          data: price.data.map(point => ({
            timestamp: point.timestamp,
            avg_price: point.avg_price
          })),
          formatted: {
            avg: formatPrice(avgPrice),
            min: formatPrice(minPrice),
            max: formatPrice(maxPrice)
          }
        }
      } else {
        acc[price.item_id] = null
      }
      return acc
    }, {})

    return NextResponse.json(processedPrices)
  } catch (error: unknown) {
    console.error('Error fetching price data:', error)
    return new NextResponse(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500 }
    )
  }
} 