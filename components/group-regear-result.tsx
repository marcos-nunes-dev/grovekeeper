'use client'

import { useState, useEffect, useMemo } from 'react'
import { formatPrice } from '@/lib/utils/price'
import { ChevronDown, MapPin, Search } from 'lucide-react'
import type { GroupRegearResult, RegearFilters, EquipmentSlot } from '@/lib/types/regear'
import { CARRYING_MOUNT_IDS } from '@/lib/types/regear'
import Image from 'next/image'
import RegearResult from '@/components/regear-result'
import GroupRegearFilters from '@/components/group-regear-filters'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import type { PriceEquivalent } from '@/lib/hooks/useRegearQueries'

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

function getItemSlot(itemId: string): EquipmentSlot {
  if (itemId.includes('_HEAD_')) return 'head'
  if (itemId.includes('_ARMOR_')) return 'armor'
  if (itemId.includes('_SHOES_')) return 'shoes'
  if (itemId.includes('_CAPE')) return 'cape'
  if (itemId.includes('_BAG')) return 'bag'
  if (itemId.includes('_MOUNT_')) return 'mount'
  if (itemId.includes('_POTION_')) return 'potion'
  if (itemId.includes('_MEAL_') || itemId.includes('_FOOD_')) return 'food'
  if (itemId.includes('_OFF_')) return 'offhand'
  return 'weapon'
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

export default function GroupRegearResultDisplay({ result }: GroupRegearResultProps) {
  const [filters, setFilters] = useState<RegearFilters>(() => {
    return loadFiltersFromStorage() || DEFAULT_FILTERS
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [openDeaths, setOpenDeaths] = useState<Set<string>>(new Set([result.results[0]?.killId].filter(Boolean)))
  const [priceDisplay, setPriceDisplay] = useState<'silver' | PriceEquivalent>('silver')
  const [equivalentPrices, setEquivalentPrices] = useState<Record<PriceEquivalent, number>>({} as Record<PriceEquivalent, number>)
  const filteredResult = applyFilters(result, filters)

  // Save filters to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters))
  }, [filters])

  // Fetch all equivalent prices when component mounts
  useEffect(() => {
    const fetchAllEquivalentPrices = async () => {
      try {
        const items = ['T4_SKILLBOOK_STANDARD', 'TREASURE_DECORATIVE_RARITY1', 'UNIQUE_GVGTOKEN_GENERIC']
        const response = await fetch(`/api/prices/v2?items=${items.map(item => `${item}:1`).join(',')}`)
        if (!response.ok) throw new Error('Failed to fetch equivalent prices')
        const data = await response.json()
        
        // Extract average prices
        const prices = items.reduce((acc, item) => {
          acc[item as PriceEquivalent] = data[item]?.[1]?.avg_price ?? 0
          return acc
        }, {} as Record<PriceEquivalent, number>)
        
        setEquivalentPrices(prices)
      } catch (error) {
        console.error('Error fetching equivalent prices:', error)
      }
    }

    fetchAllEquivalentPrices()
  }, []) // Only fetch on mount

  const filteredResults = useMemo(() => {
    let results = filteredResult.results
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      results = results.filter(({ killId, result: deathResult }) => 
        deathResult.playerName?.toLowerCase().includes(query) ||
        deathResult.location?.toLowerCase().includes(query) ||
        killId.toString().includes(query)
      )
    }
    return results
  }, [filteredResult.results, searchQuery])

  const toggleDeath = (killId: string) => {
    setOpenDeaths(prev => {
      const next = new Set(prev)
      if (next.has(killId)) {
        next.delete(killId)
      } else {
        next.add(killId)
      }
      return next
    })
  }

  // Calculate equivalent values
  const displayValue = useMemo(() => {
    if (priceDisplay === 'silver') return filteredResult.total.value

    const equivalentPrice = equivalentPrices[priceDisplay as Exclude<PriceEquivalent, 'silver'>]
    if (!equivalentPrice) return filteredResult.total.value

    return Math.floor(filteredResult.total.value / equivalentPrice)
  }, [filteredResult.total.value, priceDisplay, equivalentPrices])

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
      <div className="space-y-4">
        <div className="flex items-center gap-2 bg-[#1C2128] rounded-lg border border-zinc-800/50 px-4 py-2">
          <Search className="w-5 h-5 text-zinc-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by player name ..."
            className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
          />
        </div>
        <GroupRegearFilters filters={filters} onChange={setFilters} />
      </div>
      
      <div className="space-y-4">
        {filteredResults.map(({ killId, result: deathResult }) => (
          <Collapsible 
            key={killId} 
            open={openDeaths.has(killId)}
            onOpenChange={() => toggleDeath(killId)}
          >
            <div className="rounded-lg overflow-hidden">
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center justify-between p-4 bg-[#1C2128]">
                  <div className="flex items-center gap-2">
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${openDeaths.has(killId) ? 'rotate-180' : ''}`} />
                    <h3 className="text-lg font-medium">
                      Death #{killId}
                      {deathResult.playerName && (
                        <span className="text-zinc-400 ml-2">
                          ({deathResult.playerName}{deathResult.ip ? ` - ${Math.round(deathResult.ip)}IP` : ''})
                        </span>
                      )}
                    </h3>
                    {deathResult.location && (
                      <div className="flex items-center gap-1 text-zinc-400">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{deathResult.location}</span>
                      </div>
                    )}
                  </div>
                  <span className="text-sm text-zinc-400">
                    Total: {deathResult.total.formatted} silver
                  </span>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="border-t border-zinc-800/50">
                  <RegearResult result={deathResult} compact />
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
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
                      <div className="w-10 h-10 bg-zinc-900 rounded border border-zinc-800">
                        <Image
                          src={`https://render.albiononline.com/v1/item/${priceDisplay}.png`}
                          alt={getPriceDisplayText()}
                          width={40}
                          height={40}
                          className="w-full h-full object-contain"
                        />
                      </div>
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
                  <Image
                    src="https://render.albiononline.com/v1/item/T4_SKILLBOOK_STANDARD.png"
                    alt="Tome of Insight"
                    width={24}
                    height={24}
                    className="w-6 h-6 object-contain"
                  />
                  <div className="flex flex-col">
                    <span>Tomes of Insight</span>
                    {equivalentPrices?.T4_SKILLBOOK_STANDARD ? (
                      <span className="text-xs text-zinc-500">{formatPrice(equivalentPrices.T4_SKILLBOOK_STANDARD)} silver each</span>
                    ) : null}
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPriceDisplay('TREASURE_DECORATIVE_RARITY1')} className="gap-2">
                  <Image
                    src="https://render.albiononline.com/v1/item/TREASURE_DECORATIVE_RARITY1.png"
                    alt="Toy"
                    width={24}
                    height={24}
                    className="w-6 h-6 object-contain"
                  />
                  <div className="flex flex-col">
                    <span>Toys</span>
                    {equivalentPrices?.TREASURE_DECORATIVE_RARITY1 ? (
                      <span className="text-xs text-zinc-500">{formatPrice(equivalentPrices.TREASURE_DECORATIVE_RARITY1)} silver each</span>
                    ) : null}
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPriceDisplay('UNIQUE_GVGTOKEN_GENERIC')} className="gap-2">
                  <Image
                    src="https://render.albiononline.com/v1/item/UNIQUE_GVGTOKEN_GENERIC.png"
                    alt="Siphoned Energy"
                    width={24}
                    height={24}
                    className="w-6 h-6 object-contain"
                  />
                  <div className="flex flex-col">
                    <span>Siphoned Energy</span>
                    {equivalentPrices?.UNIQUE_GVGTOKEN_GENERIC ? (
                      <span className="text-xs text-zinc-500">{formatPrice(equivalentPrices.UNIQUE_GVGTOKEN_GENERIC)} silver each</span>
                    ) : null}
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  )
} 