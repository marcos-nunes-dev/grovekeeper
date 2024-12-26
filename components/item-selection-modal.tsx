import { useState, useEffect, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Search } from 'lucide-react'
import Image from 'next/image'
import itemNames from '@/lib/utils/item-names.json'
import { AlbionItem } from '@/lib/albion-items'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface ItemNameData {
  LocalizationNameVariable: string
  LocalizationDescriptionVariable: string
  LocalizedNames: {
    'EN-US': string
    [key: string]: string
  }
  LocalizedDescriptions: {
    [key: string]: string
  }
  Index: string
  UniqueName: string
}

interface ItemSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (item: AlbionItem) => void
  selectedSlot: string | null
}

function getTierFromUniqueName(uniqueName: string): number {
  const match = uniqueName.match(/^T(\d+)_/)
  return match ? parseInt(match[1]) : 4
}

function getEnchantmentFromUniqueName(uniqueName: string): number {
  const match = uniqueName.match(/@(\d+)$/)
  return match ? parseInt(match[1]) : 0
}

function getItemType(uniqueName: string): string {
  return uniqueName.split('_').slice(1).join('_')
}

function isValidItem(item: any): item is ItemNameData {
  return (
    item &&
    typeof item === 'object' &&
    'UniqueName' in item &&
    'LocalizedNames' in item &&
    item.LocalizedNames &&
    typeof item.LocalizedNames === 'object' &&
    'EN-US' in item.LocalizedNames &&
    typeof item.LocalizedNames['EN-US'] === 'string'
  )
}

function getBaseItemType(uniqueName: string): string {
  // Remove tier prefix and enchantment suffix
  return uniqueName.replace(/^T\d+_/, '').replace(/@\d+$/, '')
}

interface TierOption {
  value: string
  label: string
  color: string
  tier: number
  enchantment?: number
}

const tierOptions: TierOption[] = [
  { value: 'any', label: 'Any Tier', color: 'bg-zinc-500', tier: 0 },
  { value: 'T4_0', label: 'Tier 4', color: 'bg-blue-500', tier: 4 },
  { value: 'T4_1', label: 'Tier 4.1', color: 'bg-blue-500', tier: 4, enchantment: 1 },
  { value: 'T4_2', label: 'Tier 4.2', color: 'bg-blue-500', tier: 4, enchantment: 2 },
  { value: 'T4_3', label: 'Tier 4.3', color: 'bg-blue-500', tier: 4, enchantment: 3 },
  { value: 'T5_0', label: 'Tier 5', color: 'bg-red-500', tier: 5 },
  { value: 'T5_1', label: 'Tier 5.1', color: 'bg-red-500', tier: 5, enchantment: 1 },
  { value: 'T5_2', label: 'Tier 5.2', color: 'bg-red-500', tier: 5, enchantment: 2 },
  { value: 'T5_3', label: 'Tier 5.3', color: 'bg-red-500', tier: 5, enchantment: 3 },
  { value: 'T6_0', label: 'Tier 6', color: 'bg-orange-500', tier: 6 },
  { value: 'T6_1', label: 'Tier 6.1', color: 'bg-orange-500', tier: 6, enchantment: 1 },
  { value: 'T6_2', label: 'Tier 6.2', color: 'bg-orange-500', tier: 6, enchantment: 2 },
  { value: 'T6_3', label: 'Tier 6.3', color: 'bg-orange-500', tier: 6, enchantment: 3 },
  { value: 'T7_0', label: 'Tier 7', color: 'bg-yellow-500', tier: 7 },
  { value: 'T7_1', label: 'Tier 7.1', color: 'bg-yellow-500', tier: 7, enchantment: 1 },
  { value: 'T7_2', label: 'Tier 7.2', color: 'bg-yellow-500', tier: 7, enchantment: 2 },
  { value: 'T7_3', label: 'Tier 7.3', color: 'bg-yellow-500', tier: 7, enchantment: 3 },
  { value: 'T8_0', label: 'Tier 8', color: 'bg-white', tier: 8 },
  { value: 'T8_1', label: 'Tier 8.1', color: 'bg-white', tier: 8, enchantment: 1 },
  { value: 'T8_2', label: 'Tier 8.2', color: 'bg-white', tier: 8, enchantment: 2 },
  { value: 'T8_3', label: 'Tier 8.3', color: 'bg-white', tier: 8, enchantment: 3 },
]

export default function ItemSelectionModal({
  isOpen,
  onClose,
  onSelect,
  selectedSlot,
}: ItemSelectionModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedTerm, setDebouncedTerm] = useState('')
  const [selectedTierOption, setSelectedTierOption] = useState<string>('any')

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm)
    }, 300) // Wait 300ms after user stops typing

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Get valid items once
  const validItems = useMemo(() => {
    return (itemNames as any[]).filter(isValidItem)
  }, [])

  // Filter and sort items based on debounced search term and filters
  const filteredAndSortedItems = useMemo(() => {
    const filtered = debouncedTerm.trim() === '' ? 
      // When no search term, show only base items (no enchantments)
      validItems
        .filter(item => !item.UniqueName.includes('@')) // Filter out enchanted items
        .sort((a, b) => a.LocalizedNames['EN-US'].localeCompare(b.LocalizedNames['EN-US']))
        .slice(0, 15) // Limit to 15 items
      : 
      // When searching, show all items that match the search term and filters
      validItems.filter((item) => {
        const matchesSearch = 
          item.LocalizedNames['EN-US'].toLowerCase().includes(debouncedTerm.toLowerCase()) ||
          item.UniqueName.toLowerCase().includes(debouncedTerm.toLowerCase())

        if (!matchesSearch) return false

        // Apply tier and enchantment filter if selected
        if (selectedTierOption !== 'any') {
          const selectedOption = tierOptions.find(opt => opt.value === selectedTierOption)
          if (!selectedOption) return false

          const itemTier = getTierFromUniqueName(item.UniqueName)
          const itemEnchantment = getEnchantmentFromUniqueName(item.UniqueName)

          if (itemTier !== selectedOption.tier) return false
          if (selectedOption.enchantment !== undefined && itemEnchantment !== selectedOption.enchantment) return false
        }

        return true
      })

    // Sort filtered items
    return filtered.sort((a, b) => {
      const tierA = getTierFromUniqueName(a.UniqueName)
      const tierB = getTierFromUniqueName(b.UniqueName)
      if (tierA !== tierB) {
        return tierA - tierB
      }
      // Group same base items together
      const baseA = getBaseItemType(a.UniqueName)
      const baseB = getBaseItemType(b.UniqueName)
      if (baseA !== baseB) {
        return a.LocalizedNames['EN-US'].localeCompare(b.LocalizedNames['EN-US'])
      }
      // Sort enchanted items after base items
      const enchantA = a.UniqueName.match(/@(\d+)$/)?.[1] || '0'
      const enchantB = b.UniqueName.match(/@(\d+)$/)?.[1] || '0'
      return parseInt(enchantA) - parseInt(enchantB)
    })
  }, [validItems, debouncedTerm, selectedTierOption])

  const slotDisplayName = selectedSlot ? 
    selectedSlot.charAt(0).toUpperCase() + selectedSlot.slice(1).replace(/([A-Z])/g, ' $1') : 
    'Item'

  const handleSelect = (item: ItemNameData) => {
    onSelect({
      id: item.UniqueName,
      name: item.LocalizedNames['EN-US'],
      tier: getTierFromUniqueName(item.UniqueName),
      itemType: getItemType(item.UniqueName),
      slot: selectedSlot || undefined
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] bg-[#0D1117] border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-white flex items-center gap-2">
            {selectedTierOption !== 'any' && (
              <div className={`w-3 h-3 rounded-full ${tierOptions.find(opt => opt.value === selectedTierOption)?.color}`} />
            )}
            Select {slotDisplayName}
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-[#161B22] border-zinc-800 text-zinc-300 focus-visible:ring-zinc-700"
            />
          </div>

          <Select value={selectedTierOption} onValueChange={setSelectedTierOption}>
            <SelectTrigger className="w-[130px] bg-[#161B22] border-zinc-800">
              <SelectValue placeholder="Select Tier" />
            </SelectTrigger>
            <SelectContent className="bg-[#161B22] border-zinc-800">
              {tierOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${option.color}`} />
                    <span>{option.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <ScrollArea className="h-[500px] w-full rounded-md border border-zinc-800 bg-[#161B22] p-4">
          <div className="grid grid-cols-5 gap-3">
            {filteredAndSortedItems.map((item) => (
              <div
                key={item.UniqueName}
                className="flex flex-col items-center justify-between p-2 rounded cursor-pointer hover:bg-[#252D38] border border-transparent hover:border-zinc-700/50 transition-colors"
                onClick={() => handleSelect(item)}
              >
                <div className="w-16 h-16 bg-[#0D1117] rounded border border-zinc-800/50 p-2 mb-2">
                  <Image
                    src={`https://render.albiononline.com/v1/item/${item.UniqueName}`}
                    alt={item.LocalizedNames['EN-US']}
                    width={48}
                    height={48}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-xs text-center text-zinc-300 line-clamp-2">{item.LocalizedNames['EN-US']}</span>
                <span className="text-xs text-zinc-500 mt-1">Tier {getTierFromUniqueName(item.UniqueName)}</span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

