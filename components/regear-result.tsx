import { cn } from '@/lib/utils'
import type { RegearResult, RegearItem } from '@/lib/types/regear'
import { HelpCircle } from 'lucide-react'
import { formatPrice } from '@/lib/utils/price'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { PriceHistoryChart } from './price-history-chart'

interface RegearResultProps {
  result: RegearResult
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
  if (value === 0) {
    return (
      <div className="flex items-center gap-1">
        <span className="text-zinc-400">???</span>
        <HelpCircle className="w-4 h-4 text-zinc-400" />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1">
      <span className="text-zinc-300">
        {formattedValue} silver
        {count > 1 && (
          <span className="text-sm text-zinc-500 ml-1">each</span>
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
                <p className="text-sm text-zinc-400">This price shows high variation or low market activity in the last 24 hours. Check the graph below for price trends.</p>
              </div>
              <PriceHistoryChart data={priceHistory} />
            </div>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  )
}

function ItemTable({ items, title }: { items: RegearItem[], title: string }) {
  const total = items.reduce((sum, item) => sum + (item.value * item.count), 0)

  return (
    <div className="rounded-lg border border-zinc-800/50 overflow-hidden">
      <div className="bg-[#1C2128] p-4 border-b border-zinc-800/50">
        <h2 className="text-lg font-semibold flex items-center justify-between">
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
              <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400 w-1/2">Item</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400 w-1/2">Value</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                className={cn(
                  "transition-colors hover:bg-[#1C2128]",
                  "bg-[#0D1117]"
                )}
              >
                <td className="py-2 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded bg-[#1C2128] border border-zinc-800/50 p-1">
                      <img
                        src={`https://render.albiononline.com/v1/item/${item.id}.png`}
                        alt={item.name}
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

export default function RegearResult({ result }: RegearResultProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ItemTable items={result.equipped} title="Equipped Items" />
        <ItemTable items={result.bag} title="Items in Bag" />
      </div>
      <div className="rounded-lg border border-zinc-800/50 p-4 bg-[#1C2128]">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Total Regear Cost</h2>
          <span className="text-[#00E6B4] font-semibold">
            {result.total.formatted} silver
          </span>
        </div>
      </div>
    </div>
  )
}

