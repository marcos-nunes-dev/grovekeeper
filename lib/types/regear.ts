export interface RegearItem {
  id: string
  name: string
  value: number
  formattedValue: string
  quality: number
  count: number
  isReliablePrice: boolean
  priceHistory: Array<{
    timestamp: string
    price: number
  }>
}

export interface RegearResult {
  equipped: RegearItem[]
  bag: RegearItem[]
  total: {
    value: number
    formatted: string
  }
}

export interface KillboardResponse {
  EventId: string
  Victim: {
    Equipment: {
      [key: string]: {
        Type: string
        Count: number
        Quality: number
      } | null
    }
    Inventory: Array<{
      Type: string
      Count: number
      Quality: number
    } | null>
  }
}

export interface PriceData {
  avg_price: number
  min_price: number
  max_price: number
  data_points?: number
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

export interface PricesResponse {
  [key: string]: PriceData | null
} 