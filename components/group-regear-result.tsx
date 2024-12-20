'use client'

import { memo, useState, useMemo } from 'react'
import type { GroupRegearResult } from '@/lib/types/regear'
import RegearResult from './regear-result'
import { formatPrice } from '@/lib/utils/price'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
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

export default memo(function GroupRegearResult({ result }: GroupRegearResultProps) {
  const [customCalculation, setCustomCalculation] = useState(false)
  const [ignoredItems, setIgnoredItems] = useState<Set<string>>(new Set())
  const [priceDisplay, setPriceDisplay] = useState<'silver' | PriceEquivalent>('silver')
  const { data: equivalentPrices } = useEquivalentPrices()

  // Calculate total value excluding ignored items
  const calculatedTotal = useMemo(() => {
    if (!customCalculation) return result.total.value

    return result.results.reduce((sum, { result: individualResult }) => {
      const allItems = [...individualResult.equipped, ...individualResult.bag]
      const individualTotal = allItems.reduce((itemSum, item) => {
        if (ignoredItems.has(`${item.id}-${item.quality}`)) return itemSum
        return itemSum + (item.value * item.count)
      }, 0)
      return sum + individualTotal
    }, 0)
  }, [result, customCalculation, ignoredItems])

  // Calculate equivalent values
  const displayValue = useMemo(() => {
    if (priceDisplay === 'silver' || !equivalentPrices) return calculatedTotal

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
    <div className="space-y-8 pb-24">
      {result.results.map(({ killId, result: individualResult }) => (
        <div key={killId} className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-zinc-300">
              Death #{killId}
            </h3>
            <span className="text-sm text-zinc-400">
              Total: {individualResult.total.formatted} silver
            </span>
          </div>
          <RegearResult 
            result={individualResult} 
            compact 
            customCalculation={customCalculation}
            ignoredItems={ignoredItems}
            onToggleItem={(itemId, quality) => {
              const key = `${itemId}-${quality}`
              const newIgnored = new Set(ignoredItems)
              if (newIgnored.has(key)) {
                newIgnored.delete(key)
              } else {
                newIgnored.add(key)
              }
              setIgnoredItems(newIgnored)
            }}
            onToggleAll={(items) => {
              const newIgnored = new Set(ignoredItems)
              const allKeys = items.map(item => `${item.id}-${item.quality}`)
              const allAreIgnored = allKeys.every(key => ignoredItems.has(key))

              if (allAreIgnored) {
                // Remove all items from ignored set
                allKeys.forEach(key => newIgnored.delete(key))
              } else {
                // Add all items to ignored set
                allKeys.forEach(key => newIgnored.add(key))
              }
              setIgnoredItems(newIgnored)
            }}
          />
        </div>
      ))}
      <div className="fixed bottom-0 left-0 right-0 bg-[#1C2128] border-t border-zinc-800/50">
        <div className="container mx-auto px-4">
          <div className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold">Total Group Regear Cost</h2>
              <div className="flex items-center gap-2">
                <Switch
                  id="custom-calculation"
                  checked={customCalculation}
                  onCheckedChange={setCustomCalculation}
                />
                <Label htmlFor="custom-calculation" className="text-sm">
                  Custom Mode
                </Label>
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
}) 