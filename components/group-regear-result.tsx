'use client'

import { useState, useEffect } from 'react'
import RegearResult from '@/components/regear-result'
import GroupRegearFilters from '@/components/group-regear-filters'
import { CARRYING_MOUNT_IDS, EQUIPMENT_SLOTS } from '@/lib/types/regear'
import type { GroupRegearResult, RegearFilters, EquipmentSlot } from '@/lib/types/regear'
import { formatPrice } from '@/lib/utils/price'
import { ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useEquivalentPrices, type PriceEquivalent } from '@/lib/hooks/useRegearQueries'

interface GroupRegearResultProps {
  result: GroupRegearResult
}

const DEFAULT_FILTERS: RegearFilters = {
  denyBag: false,
  denyCarryingMount: false,
  minIP: 1400,
  regearSlots: ['weapon', 'offhand', 'head', 'armor', 'shoes', 'cape'],
  ignoreBagItems: false,
  enableMinIP: false
}

const STORAGE_KEY = 'grovekeeper:group-regear-filters'

function loadFiltersFromStorage(): RegearFilters | null {
  if (typeof window === 'undefined') return null
  
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return null

  try {
    return JSON.parse(stored)
  } catch (error) {
    console.error('Failed to parse stored filters:', error)
    return null
  }
}

function applyFilters(result: GroupRegearResult, filters: RegearFilters): GroupRegearResult {
  const filteredResults = result.results.map(({ killId, result: deathResult }) => {
    // Check if player has a bag equipped
    const hasBagEquipped = deathResult.equipped.some(item => item.id.includes('_BAG'))
    if (filters.denyBag && hasBagEquipped) {
      return null
    }

    // Check if player has a carrying mount
    const hasCarryingMount = deathResult.equipped.some(item => 
      CARRYING_MOUNT_IDS.includes(item.id)
    )
    if (filters.denyCarryingMount && hasCarryingMount) {
      return null
    }

    // Check IP requirement
    if (filters.enableMinIP && deathResult.ip && deathResult.ip < filters.minIP) {
      return null
    }

    // Filter equipment slots
    const filteredEquipped = deathResult.equipped.filter(item => {
      const slot = getItemSlot(item.id)
      return filters.regearSlots.includes(slot)
    })

    // Apply bag items filter
    const filteredBag = filters.ignoreBagItems ? [] : deathResult.bag

    // Calculate new total
    const totalValue = [...filteredEquipped, ...filteredBag].reduce(
      (sum, item) => sum + (item.value * item.count), 
      0
    )

    return {
      killId,
      result: {
        ...deathResult,
        equipped: filteredEquipped,
        bag: filteredBag,
        total: {
          value: totalValue,
          formatted: formatPrice(totalValue)
        }
      }
    }
  }).filter((r): r is NonNullable<typeof r> => r !== null)

  // Calculate new grand total
  const grandTotal = filteredResults.reduce(
    (sum, { result }) => sum + result.total.value, 
    0
  )

  return {
    results: filteredResults,
    total: {
      value: grandTotal,
      formatted: formatPrice(grandTotal)
    }
  }
}

function getItemSlot(itemId: string): EquipmentSlot {
  if (itemId.includes('_HEAD_')) return 'head'
  if (itemId.includes('_ARMOR_')) return 'armor'
  if (itemId.includes('_SHOES_')) return 'shoes'
  if (itemId.includes('_CAPE')) return 'cape'
  if (itemId.includes('_MOUNT_')) return 'mount'
  if (itemId.includes('_POTION_')) return 'potion'
  if (itemId.includes('_MEAL_') || itemId.includes('_FOOD_')) return 'food'
  if (itemId.includes('_OFF_')) return 'offhand'
  return 'weapon'
}

export default function GroupRegearResultDisplay({ result }: GroupRegearResultProps) {
  const [filters, setFilters] = useState<RegearFilters>(() => {
    return loadFiltersFromStorage() || DEFAULT_FILTERS
  })
  const [priceDisplay, setPriceDisplay] = useState<'silver' | PriceEquivalent>('silver')
  const { data: equivalentPrices } = useEquivalentPrices()
  const filteredResult = applyFilters(result, filters)

  // Save filters to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters))
  }, [filters])

  // Calculate equivalent values
  const displayValue = priceDisplay === 'silver' || !equivalentPrices 
    ? filteredResult.total.value
    : Math.floor(filteredResult.total.value / equivalentPrices[priceDisplay])

  // Get display text for the current price type
  const getPriceDisplayText = () => {
    switch (priceDisplay) {
      case 'T4_SKILLBOOK_STANDARD':
        return 'Tomes of Insight'
      case 'TREASURE_DECORATIVE_RARITY1':
        return 'Toys'
      case 'UNIQUE_GVGTOKEN_GENERIC':
        return 'Siphoned Energy'
      default:
        return 'Silver'
    }
  }

  return (
    <div className="space-y-6 pb-24">
      <GroupRegearFilters filters={filters} onChange={setFilters} />
      
      <div className="space-y-8">
        {filteredResult.results.map(({ killId, result: deathResult }) => (
          <div key={killId} className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">
                Death #{killId}
                {deathResult.playerName && (
                  <span className="text-zinc-400 ml-2">
                    ({deathResult.playerName})
                  </span>
                )}
              </h3>
              <span className="text-sm text-zinc-400">
                Total: {deathResult.total.formatted} silver
              </span>
            </div>
            <RegearResult result={deathResult} compact />
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-[#1C2128] border-t border-zinc-800/50">
        <div className="container mx-auto px-4">
          <div className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold">Total Group Regear Cost</h2>
              <div className="text-sm text-zinc-400">
                {filteredResult.results.length} deaths analyzed
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 text-[#00E6B4] font-semibold">
                  <div className="flex items-center gap-2">
                    {priceDisplay !== 'silver' && (
                      <img
                        src={`https://render.albiononline.com/v1/item/${priceDisplay}.png`}
                        alt={getPriceDisplayText()}
                        className="w-6 h-6 object-contain"
                      />
                    )}
                    <span>{formatPrice(displayValue)} {priceDisplay === 'silver' ? 'silver' : getPriceDisplayText()}</span>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuItem onClick={() => setPriceDisplay('silver')} className="gap-2">
                  Silver
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPriceDisplay('T4_SKILLBOOK_STANDARD')} className="gap-2">
                  <img
                    src="https://render.albiononline.com/v1/item/T4_SKILLBOOK_STANDARD.png"
                    alt="Tome of Insight"
                    className="w-6 h-6 object-contain"
                  />
                  Tomes of Insight
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPriceDisplay('TREASURE_DECORATIVE_RARITY1')} className="gap-2">
                  <img
                    src="https://render.albiononline.com/v1/item/TREASURE_DECORATIVE_RARITY1.png"
                    alt="Toy"
                    className="w-6 h-6 object-contain"
                  />
                  Toys
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPriceDisplay('UNIQUE_GVGTOKEN_GENERIC')} className="gap-2">
                  <img
                    src="https://render.albiononline.com/v1/item/UNIQUE_GVGTOKEN_GENERIC.png"
                    alt="Siphoned Energy"
                    className="w-6 h-6 object-contain"
                  />
                  Siphoned Energy
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  )
} 