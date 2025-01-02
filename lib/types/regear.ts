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

export type EquipmentSlot = 'weapon' | 'offhand' | 'head' | 'armor' | 'shoes' | 'cape' | 'mount' | 'bag' | 'potion' | 'food'

export interface RegearResult {
  equipped: RegearItem[]
  bag: RegearItem[]
  total: {
    value: number
    formatted: string
  }
  playerName?: string
  ip?: number
  location?: string
}

export interface GroupRegearResult {
  results: Array<{
    killId: string
    result: RegearResult
  }>
  total: {
    value: number
    formatted: string
  }
}

export interface KillboardResponse {
  EventId: string
  TimeStamp: string
  Version: number
  Victim: {
    Name: string
    Id: string
    AverageItemPower: number
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
  TotalVictimKillFame: number
  Location: string
  Participants: Array<{
    Name: string
    Id: string
    GuildName: string
    GuildId: string
    AllianceName: string
    AllianceId: string
    Equipment: {
      [key: string]: {
        Type: string
        Count: number
        Quality: number
      } | null
    }
    AverageItemPower: number
    DamageDone: number
    SupportHealingDone: number
  }>
}

export interface PriceData {
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

export interface PricesResponse {
  [itemId: string]: {
    [quality: string]: PriceData | null
  }
}

export interface RegearFilters {
  denyBag: boolean
  denyCarryingMount: boolean
  minIP: number
  regearSlots: EquipmentSlot[]
  ignoreBagItems: boolean
  enableMinIP: boolean
}

export const EQUIPMENT_SLOTS: Record<EquipmentSlot, string> = {
  weapon: 'Weapon',
  offhand: 'Off-hand',
  head: 'Head',
  armor: 'Armor',
  shoes: 'Shoes',
  cape: 'Cape',
  mount: 'Mount',
  bag: 'Bag',
  potion: 'Potion',
  food: 'Food'
}

export const CARRYING_MOUNT_IDS = ['T3_MOUNT_HORSE', 'T4_MOUNT_HORSE', 'T5_MOUNT_HORSE', 'T6_MOUNT_HORSE', 'T7_MOUNT_HORSE', 'T8_MOUNT_HORSE', 'T3_MOUNT_OX', 'T4_MOUNT_OX', 'T5_MOUNT_OX', 'T6_MOUNT_OX', 'T7_MOUNT_OX', 'T8_MOUNT_OX', 'T3_MOUNT_MULE', 'T4_MOUNT_MULE', 'T5_MOUNT_MULE', 'T6_MOUNT_MULE', 'T7_MOUNT_MULE', 'T8_MOUNT_MULE', 'T5_MOUNT_MULE_COMBAT', 'T3_MOUNT_STAG', 'T4_MOUNT_STAG', 'T5_MOUNT_STAG', 'T6_MOUNT_STAG', 'T7_MOUNT_STAG', 'T8_MOUNT_STAG', 'T5_MOUNT_WILDBOAR_KEEPER', 'T5_MOUNT_SALAMANDER_HERETIC', 'T5_MOUNT_MOOSE_KEEPER', 'T7_MOUNT_RAM_KEEPER', 'T7_MOUNT_DIREBOAR_KEEPER', 'T8_MOUNT_SWAMPDRAGON_KEEPER', 'T8_MOUNT_BEAR_KEEPER', 'UNIQUE_MOUNT_GIANTSTAG_FOUNDER_EPIC']
  