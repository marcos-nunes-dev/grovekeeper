'use client'

import { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, Shield, Sword, Cpu } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RegearFilters, EquipmentSlot } from '@/lib/types/regear'
import { EQUIPMENT_SLOTS } from '@/lib/types/regear'
import { Badge } from '@/components/ui/badge'

interface GroupRegearFiltersProps {
  filters: RegearFilters
  onChange: (filters: RegearFilters) => void
}

const DEFAULT_FILTERS: RegearFilters = {
  denyBag: false,
  denyCarryingMount: false,
  minIP: 0,
  regearSlots: ['weapon', 'offhand', 'head', 'armor', 'shoes', 'cape'],
  ignoreBagItems: false,
  enableMinIP: false
}

function getActiveFiltersSummary(filters: RegearFilters): string[] {
  const summary: string[] = []

  // Basic rules
  if (filters.denyBag) summary.push('No Bags')
  if (filters.denyCarryingMount) summary.push('No Transport Mounts')
  if (filters.ignoreBagItems) summary.push('Ignore Bag Items')

  // IP requirement
  if (filters.enableMinIP && filters.minIP > 0) {
    summary.push(`Min IP: ${filters.minIP}`)
  }

  // Equipment slots
  const defaultSlots = new Set(DEFAULT_FILTERS.regearSlots)
  
  if (filters.regearSlots.length < DEFAULT_FILTERS.regearSlots.length) {
    const slots = filters.regearSlots.map(slot => EQUIPMENT_SLOTS[slot]).join(', ')
    summary.push(`Only: ${slots}`)
  } else if (filters.regearSlots.length > DEFAULT_FILTERS.regearSlots.length) {
    const extraSlots = filters.regearSlots
      .filter(slot => !defaultSlots.has(slot))
      .map(slot => EQUIPMENT_SLOTS[slot])
      .join(', ')
    summary.push(`+${extraSlots}`)
  }

  return summary
}

export default function GroupRegearFilters({ filters, onChange }: GroupRegearFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const activeFilters = getActiveFiltersSummary(filters)
  const hasCustomFilters = activeFilters.length > 0

  const handleSlotToggle = (slot: EquipmentSlot) => {
    const newSlots = filters.regearSlots.includes(slot)
      ? filters.regearSlots.filter(s => s !== slot)
      : [...filters.regearSlots, slot]
    onChange({ ...filters, regearSlots: newSlots })
  }

  return (
    <div className="bg-[#0D1117] border border-zinc-800/50 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-zinc-800/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <span className="font-medium">Regear Filters</span>
          {!isExpanded && hasCustomFilters && (
            <div className="flex items-center gap-2">
              {activeFilters.map((filter, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="bg-[#1C2128] text-zinc-300 border-zinc-700/50"
                >
                  {filter}
                </Badge>
              ))}
            </div>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-zinc-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-zinc-400" />
        )}
      </button>

      <div
        className={cn(
          "grid transition-all duration-200",
          isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <div className="p-4 space-y-6">
            {/* Basic Rules */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-zinc-400" />
                <h3 className="text-sm font-medium text-zinc-400">Basic Rules</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="deny-bag" className="text-sm">
                    Deny regear if player has bag equipped
                  </Label>
                  <Switch
                    id="deny-bag"
                    checked={filters.denyBag}
                    onCheckedChange={(checked) => onChange({ ...filters, denyBag: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="deny-carrying-mount" className="text-sm">
                    Deny regear if player has carrying mount
                  </Label>
                  <Switch
                    id="deny-carrying-mount"
                    checked={filters.denyCarryingMount}
                    onCheckedChange={(checked) => onChange({ ...filters, denyCarryingMount: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="ignore-bag-items" className="text-sm">
                    Ignore items in bag
                  </Label>
                  <Switch
                    id="ignore-bag-items"
                    checked={filters.ignoreBagItems}
                    onCheckedChange={(checked) => onChange({ ...filters, ignoreBagItems: checked })}
                  />
                </div>
              </div>
            </div>

            {/* IP Requirement */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-zinc-400" />
                <h3 className="text-sm font-medium text-zinc-400">IP Requirement</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="enable-min-ip" className="text-sm">
                    Enable minimum IP requirement
                  </Label>
                  <Switch
                    id="enable-min-ip"
                    checked={filters.enableMinIP}
                    onCheckedChange={(checked) => onChange({ ...filters, enableMinIP: checked })}
                  />
                </div>
                {filters.enableMinIP && (
                  <div className="flex items-center gap-2">
                    <Label htmlFor="min-ip" className="text-sm whitespace-nowrap">
                      Minimum IP
                    </Label>
                    <Input
                      id="min-ip"
                      type="number"
                      min={0}
                      step={50}
                      value={filters.minIP}
                      onChange={(e) => onChange({ ...filters, minIP: Number(e.target.value) })}
                      className="w-24 bg-[#1C2128] border-zinc-700/50 focus:border-zinc-600 focus-visible:ring-1 focus-visible:ring-zinc-600"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Equipment Slots */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sword className="w-4 h-4 text-zinc-400" />
                <h3 className="text-sm font-medium text-zinc-400">Equipment Slots to Regear</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(Object.entries(EQUIPMENT_SLOTS) as [EquipmentSlot, string][]).map(([slot, label]) => (
                  <Button
                    key={slot}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSlotToggle(slot)}
                    className={cn(
                      "justify-start rounded-md",
                      filters.regearSlots.includes(slot) 
                        ? "bg-[#1C2128] text-zinc-200 border-zinc-700 hover:bg-[#1C2128]/80 hover:border-zinc-600" 
                        : "bg-transparent text-zinc-400 border-zinc-800/50 hover:bg-zinc-800/30 hover:border-zinc-700"
                    )}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Reset Button */}
            {hasCustomFilters && (
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onChange(DEFAULT_FILTERS)}
                  className="w-full text-zinc-400 hover:text-zinc-300"
                >
                  Reset to Default
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 