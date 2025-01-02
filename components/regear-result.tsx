"use client"

import { useState, useMemo, useEffect } from 'react'
import { cn } from '@/lib/utils'
import type { RegearResult, RegearItem } from '@/lib/types/regear'
import { HelpCircle, ChevronDown } from 'lucide-react'
import { formatPrice } from '@/lib/utils/price'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PriceHistoryChart } from './price-history-chart'
import type { PriceEquivalent } from '@/lib/hooks/useRegearQueries'
import Image from 'next/image'

interface RegearResultProps {
  result: RegearResult
  compact?: boolean
  customCalculation?: boolean
  ignoredItems?: Set<string>
  onToggleItem?: (itemId: string, quality: number) => void
  onToggleAll?: (items: RegearItem[]) => void
}

function getValueIndicator(value: number, isReliable: boolean): { level: number; color: string } {
  if (!isReliable || value === 0) return { level: 0, color: "bg-zinc-800" }
  if (value < 100000) return { level: 1, color: "bg-gray-400" }
  if (value < 500000) return { level: 2, color: "bg-blue-400" }
  if (value < 1000000) return { level: 3, color: "bg-green-400" }
  if (value < 5000000) return { level: 4, color: "bg-yellow-400" }
  return { level: 5, color: "bg-amber-400" }
}

function ValueIndicator({ value, isReliable }: { value: number, isReliable: boolean }) {
  const { level, color } = getValueIndicator(value, isReliable)
  
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "w-4 h-0.5 rounded-full",
            i < level ? color : "bg-zinc-800"
          )}
        />
      ))}
    </div>
  )
}

function PriceDisplay({ value, formattedValue, isReliable, priceHistory, count }: { 
  value: number
  formattedValue: string
  isReliable: boolean
  priceHistory?: Array<{ timestamp: string; price: number }>
  count: number
}) {
  // Calculate average from chart when there's high variance, excluding outliers
  const chartAverage = useMemo(() => {
    if (!priceHistory?.length) return null
    if (isReliable) return null

    // Sort prices to calculate quartiles
    const prices = priceHistory.map(point => point.price).sort((a, b) => a - b)
    const q1Index = Math.floor(prices.length * 0.25)
    const q3Index = Math.floor(prices.length * 0.75)
    const q1 = prices[q1Index]
    const q3 = prices[q3Index]
    const iqr = q3 - q1
    const lowerBound = q1 - 1.5 * iqr
    const upperBound = q3 + 1.5 * iqr

    // Filter out outliers and calculate average
    const validPrices = prices.filter(price => price >= lowerBound && price <= upperBound)
    if (!validPrices.length) return null

    const avg = validPrices.reduce((sum, price) => sum + price, 0) / validPrices.length
    return {
      value: avg,
      formatted: formatPrice(avg)
    }
  }, [isReliable, priceHistory])

  if (value === 0) {
    return (
      <div className="flex items-center gap-1">
        <span className="text-zinc-400">???</span>
        <HelpCircle className="w-4 h-4 text-zinc-400" />
      </div>
    )
  }

  const displayValue = chartAverage ? chartAverage.value : value
  const displayFormatted = chartAverage ? chartAverage.formatted : formattedValue
  const totalValue = displayValue * count

  return (
    <div className="flex items-center gap-1">
      <span className="text-zinc-300">
        {formatPrice(totalValue)} silver
        {count > 1 && (
          <span className="text-sm text-zinc-500 ml-1">({displayFormatted} each)</span>
        )}
      </span>
      {!isReliable && priceHistory && (
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <button 
              type="button" 
              className="inline-flex items-center justify-center rounded-full hover:bg-zinc-800/50 p-0.5 transition-colors"
            >
              <HelpCircle className="w-4 h-4 text-zinc-400" />
              <span className="sr-only">Price history</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="p-4 max-w-[350px]">
            <div className="space-y-2">
              <div className="space-y-1 mb-4">
                <p className="font-medium text-zinc-200">Price Variation Warning</p>
                <p className="text-sm text-zinc-400">This price shows high variation or low market activity in the last 24 hours. Using average price from historical data (excluding outliers).</p>
              </div>
              <PriceHistoryChart data={priceHistory} />
            </div>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  )
}

function ItemTable({ items, title, customCalculation, ignoredItems, onToggleItem, onToggleAll, compact }: { 
  items: RegearItem[]
  title: string
  customCalculation: boolean
  ignoredItems: Set<string>
  onToggleItem: (itemId: string, quality: number) => void
  onToggleAll: (items: RegearItem[]) => void
  compact?: boolean
}) {
  const total = items.reduce((sum, item) => {
    if (customCalculation && ignoredItems.has(`${item.id}-${item.quality}`)) return sum
    return sum + (item.value * item.count)
  }, 0)

  return (
    <div className={cn(
      "rounded-lg border border-zinc-800/50 overflow-hidden",
      compact && "text-sm"
    )}>
      <div className="bg-[#1C2128] p-4 border-b border-zinc-800/50">
        <h2 className={cn(
          "font-semibold flex items-center justify-between",
          compact ? "text-base" : "text-lg"
        )}>
          <span>{title}</span>
          <span className="text-sm text-zinc-400">
            Total: {formatPrice(total)} silver
          </span>
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#161B22]">
            <tr>
              {customCalculation && (
                <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">
                  <Checkbox
                    checked={items.every(item => 
                      ignoredItems.has(`${item.id}-${item.quality}`)
                    )}
                    onCheckedChange={() => onToggleAll(items)}
                    aria-label={`Toggle all ${title.toLowerCase()}`}
                  />
                </th>
              )}
              <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400 w-1/2">Item</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400 w-1/2">Value</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={`${item.id}-${item.quality}`}
                className={cn(
                  "transition-colors hover:bg-[#1C2128]",
                  "bg-[#0D1117]",
                  customCalculation && ignoredItems.has(`${item.id}-${item.quality}`) && "opacity-50"
                )}
              >
                {customCalculation && (
                  <td className="py-2 px-4">
                    <Checkbox
                      checked={ignoredItems.has(`${item.id}-${item.quality}`)}
                      onCheckedChange={() => onToggleItem(item.id, item.quality)}
                      aria-label={`Ignore ${item.name}`}
                    />
                  </td>
                )}
                <td className="py-2 px-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "rounded bg-[#1C2128] border border-zinc-800/50 p-1",
                      compact ? "w-8 h-8" : "w-12 h-12"
                    )}>
                      <Image
                        src={`https://render.albiononline.com/v1/item/${item.id}.png?quality=${item.quality}`}
                        alt={item.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="font-medium">
                      {item.count > 1 ? `${item.count}x ` : ''}{item.name}
                    </span>
                  </div>
                </td>
                <td className="py-2 px-4">
                  <div className="flex flex-col items-start gap-1">
                    <PriceDisplay 
                      value={item.value} 
                      formattedValue={item.formattedValue} 
                      isReliable={item.isReliablePrice}
                      priceHistory={item.priceHistory}
                      count={item.count}
                    />
                    <ValueIndicator value={item.value} isReliable={item.isReliablePrice} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function RegearResult({ 
  result, 
  compact,
  customCalculation: externalCustomCalculation,
  ignoredItems: externalIgnoredItems,
  onToggleItem: externalOnToggleItem,
  onToggleAll: externalOnToggleAll
}: RegearResultProps) {
  const [internalCustomCalculation, setInternalCustomCalculation] = useState(false)
  const [internalIgnoredItems, setInternalIgnoredItems] = useState<Set<string>>(new Set())
  const [priceDisplay, setPriceDisplay] = useState<'silver' | PriceEquivalent>('silver')
  const [equivalentPrices, setEquivalentPrices] = useState<Record<PriceEquivalent, number>>({} as Record<PriceEquivalent, number>)

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

  // Use external or internal state based on what's provided
  const customCalculation = externalCustomCalculation ?? internalCustomCalculation
  const ignoredItems = externalIgnoredItems ?? internalIgnoredItems
  const handleToggleItem = externalOnToggleItem ?? ((itemId: string, quality: number) => {
    const key = `${itemId}-${quality}`
    const newIgnored = new Set(internalIgnoredItems)
    if (newIgnored.has(key)) {
      newIgnored.delete(key)
    } else {
      newIgnored.add(key)
    }
    setInternalIgnoredItems(newIgnored)
  })
  const handleToggleAll = externalOnToggleAll ?? ((items: RegearItem[]) => {
    const newIgnored = new Set(internalIgnoredItems)
    const allKeys = items.map(item => `${item.id}-${item.quality}`)
    const allAreIgnored = allKeys.every(key => internalIgnoredItems.has(key))

    if (allAreIgnored) {
      allKeys.forEach(key => newIgnored.delete(key))
    } else {
      allKeys.forEach(key => newIgnored.add(key))
    }
    setInternalIgnoredItems(newIgnored)
  })

  // Calculate total value excluding ignored items
  const calculatedTotal = useMemo(() => {
    if (!customCalculation) return result.total.value

    const allItems = [...result.equipped, ...result.bag]
    return allItems.reduce((sum, item) => {
      if (ignoredItems.has(`${item.id}-${item.quality}`)) return sum
      return sum + (item.value * item.count)
    }, 0)
  }, [result, customCalculation, ignoredItems])

  // Calculate equivalent values
  const displayValue = useMemo(() => {
    if (priceDisplay === 'silver') return calculatedTotal

    const equivalentPrice = equivalentPrices[priceDisplay]
    if (!equivalentPrice) return calculatedTotal

    return Math.floor(calculatedTotal / equivalentPrice)
  }, [calculatedTotal, priceDisplay, equivalentPrices])

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
    <div className="space-y-6">
      <div className={cn(
        "grid gap-6",
        compact ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1 md:grid-cols-2"
      )}>
        <ItemTable 
          items={result.equipped} 
          title="Equipped Items" 
          customCalculation={customCalculation}
          ignoredItems={ignoredItems}
          onToggleItem={handleToggleItem}
          onToggleAll={handleToggleAll}
          compact={compact}
        />
        <ItemTable 
          items={result.bag} 
          title="Items in Bag" 
          customCalculation={customCalculation}
          ignoredItems={ignoredItems}
          onToggleItem={handleToggleItem}
          onToggleAll={handleToggleAll}
          compact={compact}
        />
      </div>
      {!compact && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#1C2128] border-t border-zinc-800/50">
          <div className="container mx-auto px-4">
            <div className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold">Total Regear Cost</h2>
                {!externalCustomCalculation && (
                  <div className="flex items-center gap-2">
                    <Switch
                      id="custom-calculation"
                      checked={internalCustomCalculation}
                      onCheckedChange={setInternalCustomCalculation}
                    />
                    <Label htmlFor="custom-calculation" className="text-sm">
                      Custom Mode
                    </Label>
                  </div>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 text-[#00E6B4] font-semibold">
                    <div className="flex items-center gap-2">
                      {priceDisplay !== 'silver' && (
                        <Image
                          src={`https://render.albiononline.com/v1/item/${priceDisplay}.png`}
                          alt={getPriceDisplayText()}
                          width={24}
                          height={24}
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
      )}
    </div>
  )
}

