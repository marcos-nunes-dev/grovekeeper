import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AlbionItem } from '@/lib/albion-items'
import Image from 'next/image'
import ItemSelectionModal from './item-selection-modal'
import type { Build, Swap } from '@/lib/types/composition'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { SpellSelectionPopover } from './spell-selection-popover'

interface BuildConfigurationProps {
  build: Build
  buildIndex: number
  updateBuild?: (updatedBuild: Build) => void
  removeBuild?: () => void
  showDismissible?: boolean
  readOnly?: boolean
}

const slotAssignments = [
  { index: 0, name: '' },
  { index: 1, name: 'head' },
  { index: 2, name: 'cape' },
  { index: 3, name: 'mainHand' },
  { index: 4, name: 'chest' },
  { index: 5, name: 'offHand' },
  { index: 6, name: 'potion' },
  { index: 7, name: 'shoes' },
  { index: 8, name: 'food' },
  { index: 9, name: '' },
  { index: 10, name: 'mount' },
  { index: 11, name: '' },
]

type ItemData = import('@/lib/types/composition').ItemData

export default function BuildConfiguration({
  build,
  buildIndex,
  updateBuild,
  removeBuild,
  showDismissible = false,
  readOnly = false
}: BuildConfigurationProps) {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isTwoHanded, setIsTwoHanded] = useState(false)

  useEffect(() => {
    if (!build.spells) {
      updateBuild({ ...build, spells: {} })
    }
  }, [build, updateBuild])

  const updateBuildName = (newName: string) => {
    updateBuild?.({ ...build, name: newName })
  }

  const updateInstructions = (newInstructions: string) => {
    updateBuild?.({ ...build, instructions: newInstructions })
  }

  const handleTileClick = (slot: string) => {
    if (readOnly) return
    setSelectedSlot(slot)
    setIsModalOpen(true)
  }

  const handleItemSelect = async (item: AlbionItem) => {
    if (selectedSlot) {
      if (selectedSlot.startsWith('swap-')) {
        const swapIndex = parseInt(selectedSlot.split('-')[1])
        const updatedSwaps = [...(build.swaps || [])]
        updatedSwaps[swapIndex] = {
          ...updatedSwaps[swapIndex],
          itemId: item.id,
          spells: {
            activeSpells: [],
            passiveSpells: []
          }
        }
        updateBuild?.({ ...build, swaps: updatedSwaps })
      } else {
        const updatedEquipment = { ...build.equipment }
        updatedEquipment[selectedSlot as keyof typeof build.equipment] = item.id
        
        if (selectedSlot === 'mainHand') {
          try {
            const response = await fetch(`/api/items/${item.id}/data`)
            const data = await response.json()
            setIsTwoHanded(data.twoHanded)
            
            if (data.twoHanded) {
              updatedEquipment.offHand = undefined
            }
          } catch (error) {
            console.error('Failed to check if weapon is two-handed:', error)
          }
        }
        
        const updatedSpells = { ...build.spells }
        if (!updatedSpells[item.id]) {
          updatedSpells[item.id] = {
            activeSpells: [],
            passiveSpells: []
          }
        }
        
        updateBuild?.({ 
          ...build, 
          equipment: updatedEquipment,
          spells: updatedSpells
        })
      }
      setIsModalOpen(false)
    }
  }

  const handleSpellSelect = (itemId: string, type: 'active' | 'passive', slotIndex: number, spellIndex: number) => {
    const updatedSpells = build.spells || {}
    
    if (!updatedSpells[itemId]) {
      updatedSpells[itemId] = { activeSpells: [], passiveSpells: [] }
    }
    
    const spellArray = updatedSpells[itemId][`${type}Spells`]
    spellArray[slotIndex] = spellIndex
    
    updateBuild?.({ ...build, spells: updatedSpells })
  }

  const isSlotDisabled = (slot: string) => {
    // Disable offhand slot if main weapon is two-handed
    if (slot === 'offHand' && isTwoHanded) {
      return true
    }
    return false
  }

  return (
    <div className="bg-[#0D1117] rounded-lg p-6 border border-zinc-800/50 hover:border-zinc-700/50 transition-colors">
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1 space-y-4">
          <div>
            <Label htmlFor={`build-name-${build.id}`} className="mb-2 block text-sm font-medium text-zinc-400">
              Build Name
            </Label>
            <Input
              id={`build-name-${build.id}`}
              value={build.name}
              onChange={(e) => updateBuild?.({ ...build, name: e.target.value })}
              className="bg-[#161B22] border-zinc-800/50 focus-visible:ring-zinc-700"
              placeholder="Enter build name"
              readOnly={readOnly}
            />
          </div>
        </div>
        {showDismissible && removeBuild && !readOnly && (
          <div className="flex items-center gap-4">
            <span className="text-xs text-zinc-500 px-2 py-1 bg-[#161B22] rounded-md">
              Build {buildIndex + 1}
            </span>
            {removeBuild && (
              <button
                onClick={removeBuild}
                className="text-zinc-400 hover:text-zinc-300 transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>
        )}
        {!showDismissible && removeBuild && (
          <button
            onClick={removeBuild}
            className="text-zinc-400 hover:text-zinc-300 transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <Label htmlFor={`build-role-${build.id}`} className="mb-2 block text-sm font-medium text-zinc-400">
            Role
          </Label>
          <Select
            value={build.role || ''}
            onValueChange={(value) => updateBuild?.({ ...build, role: value })}
            disabled={readOnly}
          >
            <SelectTrigger 
              id={`build-role-${build.id}`} 
              className="w-full h-10 bg-[#161B22] border-zinc-800 text-zinc-300 hover:bg-[#1C2128] focus:ring-zinc-700"
            >
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent className="bg-[#1C2128] border-zinc-800">
              <SelectItem value="Tank">Tank</SelectItem>
              <SelectItem value="Healer">Healer</SelectItem>
              <SelectItem value="RDPS">Ranged DPS</SelectItem>
              <SelectItem value="MDPS">Melee DPS</SelectItem>
              <SelectItem value="Support">Support</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor={`build-content-${build.id}`} className="mb-2 block text-sm font-medium text-zinc-400">
            Content Type
          </Label>
          <Select
            value={build.content || ''}
            onValueChange={(value) => updateBuild?.({ ...build, content: value })}
            disabled={readOnly}
          >
            <SelectTrigger 
              id={`build-content-${build.id}`} 
              className="w-full h-10 bg-[#161B22] border-zinc-800 text-zinc-300 hover:bg-[#1C2128] focus:ring-zinc-700"
            >
              <SelectValue placeholder="Select content" />
            </SelectTrigger>
            <SelectContent className="bg-[#1C2128] border-zinc-800">
              <SelectItem value="ZvZ">ZvZ (Zerg vs Zerg)</SelectItem>
              <SelectItem value="Crystal">Crystal League</SelectItem>
              <SelectItem value="SmallScale">Small Scale PvP</SelectItem>
              <SelectItem value="Ganking">Ganking</SelectItem>
              <SelectItem value="PvE">PvE / Fame Farming</SelectItem>
              <SelectItem value="HCE">HCE (Hardcore Expeditions)</SelectItem>
              <SelectItem value="Corrupted">Corrupted Dungeons</SelectItem>
              <SelectItem value="Arena">Arena / Circle of Strife</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor={`build-difficulty-${build.id}`} className="mb-2 block text-sm font-medium text-zinc-400">
            Difficulty
          </Label>
          <Select
            value={build.difficulty || ''}
            onValueChange={(value) => updateBuild?.({ ...build, difficulty: value })}
            disabled={readOnly}
          >
            <SelectTrigger 
              id={`build-difficulty-${build.id}`} 
              className="w-full h-10 bg-[#161B22] border-zinc-800 text-zinc-300 hover:bg-[#1C2128] focus:ring-zinc-700"
            >
              <SelectValue placeholder="Select difficulty" />
            </SelectTrigger>
            <SelectContent className="bg-[#1C2128] border-zinc-800">
              <SelectItem value="Beginner">Beginner Friendly</SelectItem>
              <SelectItem value="Intermediate">Intermediate</SelectItem>
              <SelectItem value="Advanced">Advanced</SelectItem>
              <SelectItem value="Expert">Expert</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor={`build-cost-${build.id}`} className="mb-2 block text-sm font-medium text-zinc-400">
            Cost Tier
          </Label>
          <Select
            value={build.costTier || ''}
            onValueChange={(value) => updateBuild?.({ ...build, costTier: value })}
            disabled={readOnly}
          >
            <SelectTrigger 
              id={`build-cost-${build.id}`} 
              className="w-full h-10 bg-[#161B22] border-zinc-800 text-zinc-300 hover:bg-[#1C2128] focus:ring-zinc-700"
            >
              <SelectValue placeholder="Select cost tier" />
            </SelectTrigger>
            <SelectContent className="bg-[#1C2128] border-zinc-800">
              <SelectItem value="Budget">Budget (4.1-6.1)</SelectItem>
              <SelectItem value="Medium">Medium (6.2-7.1)</SelectItem>
              <SelectItem value="High">High (7.2-8.1)</SelectItem>
              <SelectItem value="Premium">Premium (8.2+)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-8 mb-6">
        {/* Available Items Grid */}
        <div id="build-setup" className="flex-1 flex flex-col gap-4">
          <Label htmlFor={`build-${build.id}`} className="mb-2 block text-sm font-medium text-zinc-400">
            Items assignment build
          </Label>
          <div className="flex gap-4 h-[400px]">
            <div className="w-64">
              <div className="grid grid-cols-3 gap-2">
                {slotAssignments.map((slot) => (
                  <div
                    key={slot.index}
                    className={cn(
                      "aspect-square rounded border p-1 relative",
                      slot.name 
                        ? "border-zinc-800/50 bg-[#161B22] hover:bg-[#252D38] transition-colors cursor-pointer" 
                        : "border-transparent bg-zinc-800/20 cursor-not-allowed",
                      slot.name === 'offHand' && isTwoHanded && "opacity-50 cursor-not-allowed hover:bg-[#161B22]"
                    )}
                    onClick={() => slot.name && !isSlotDisabled(slot.name) && handleTileClick(slot.name)}
                  >
                    {slot.name && build.equipment[slot.name as keyof typeof build.equipment] && (
                      <Image
                        src={`https://render.albiononline.com/v1/item/${build.equipment[slot.name as keyof typeof build.equipment]}.png`}
                        alt={slot.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-contain"
                      />
                    )}
                    {slot.name && !build.equipment[slot.name as keyof typeof build.equipment] && (
                      <div className="absolute top-1 left-1 text-xs font-medium text-zinc-500">
                        {slot.name}
                      </div>
                    )}
                  </div>
                ))}
                {[10, 11, 12].map((index) => (
                  <div
                    key={index}
                    className="aspect-square rounded border border-transparent bg-transparent"
                  />
                ))}
              </div>
            </div>

            {/* Selected Items with Skills */}
            <div className="flex-1 space-y-4">
              {['mainHand', 'head', 'chest', 'shoes'].map((slot) => {
                const itemId = build.equipment[slot as keyof typeof build.equipment]
                return (
                  <SelectedItem
                    key={slot}
                    name={itemId || ''}
                    selectedSpells={
                      itemId && build.spells?.[itemId] 
                        ? build.spells[itemId] 
                        : { activeSpells: [], passiveSpells: [] }
                    }
                    onSpellSelect={(type, slotIndex, spellIndex) => 
                      itemId && handleSpellSelect(itemId, type, slotIndex, spellIndex)
                    }
                  />
                )
              })}
            </div>
          </div>
        </div>

        {/* Instructions Field */}
        <div className="w-1/2 flex flex-col">
          <Label htmlFor={`instructions-${build.id}`} className="mb-2 block text-sm font-medium text-zinc-400">
            How to play this build
          </Label>
          <Textarea
            id={`instructions-${build.id}`}
            value={build.instructions || ''}
            onChange={(e) => updateInstructions(e.target.value)}
            placeholder="Enter instructions on how to play this build..."
            className="flex-1 w-full bg-[#161B22] border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-300 placeholder-zinc-500 resize-none"
          />
        </div>
      </div>

      <div className="w-full mt-6">
        {!readOnly && (
          <div className="flex items-center justify-between mb-4">
            <Label className="text-sm font-medium text-zinc-400">
              Swaps
            </Label>
            <button
              onClick={() => {
                const newSwap: Swap = {
                  id: crypto.randomUUID(),
                  itemId: '',
                  description: '',
                  spells: {
                    activeSpells: [],
                    passiveSpells: []
                  }
                }
                updateBuild?.({
                  ...build,
                  swaps: [...(build.swaps || []), newSwap]
                })
              }}
              className="text-xs px-2 py-1 bg-zinc-800/50 hover:bg-zinc-800 rounded text-zinc-400 transition-colors"
            >
              Add Swap
            </button>
          </div>
        )}

        <div className="space-y-4">
          {build.swaps?.map((swap, index) => (
            <div 
              key={swap.id} 
              className="flex gap-4 p-4 bg-[#161B22] rounded-lg border border-zinc-800/50"
            >
              <div className="flex-shrink-0">
                <div 
                  onClick={() => {
                    setSelectedSlot('swap-' + index)
                    setIsModalOpen(true)
                  }}
                  className="w-12 h-12 bg-[#161B22] rounded border border-zinc-800/50 hover:bg-[#252D38] transition-colors cursor-pointer flex items-center justify-center"
                >
                  {swap.itemId ? (
                    <Image
                      src={`https://render.albiononline.com/v1/item/${swap.itemId}.png`}
                      alt={swap.itemId}
                      width={48}
                      height={48}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-xs font-medium text-zinc-500">
                      Select
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1">
                <Textarea
                  value={swap.description}
                  onChange={(e) => {
                    const updatedSwaps = [...(build.swaps || [])]
                    updatedSwaps[index] = {
                      ...swap,
                      description: e.target.value
                    }
                    updateBuild?.({ ...build, swaps: updatedSwaps })
                  }}
                  placeholder="When to use this swap..."
                  className="w-full bg-[#1C2128] border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-300 placeholder-zinc-500 resize-none h-24"
                />
              </div>

              {swap.itemId && (
                <div className="flex-shrink-0">
                  <SelectedItem
                    name={swap.itemId}
                    selectedSpells={swap.spells}
                    onSpellSelect={(type, slotIndex, spellIndex) => {
                      const updatedSwaps = [...(build.swaps || [])]
                      const spellArray = updatedSwaps[index].spells[`${type}Spells`]
                      spellArray[slotIndex] = spellIndex
                      updateBuild?.({ ...build, swaps: updatedSwaps })
                    }}
                  />
                </div>
              )}

              <button
                onClick={() => {
                  const updatedSwaps = build.swaps?.filter((_, i) => i !== index)
                  updateBuild?.({ ...build, swaps: updatedSwaps })
                }}
                className="text-zinc-400 hover:text-zinc-300 transition-colors self-start"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <ItemSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleItemSelect}
        selectedSlot={selectedSlot}
      />
    </div>
  )
}

interface SelectedItemProps {
  name: string
  onSpellSelect?: (type: 'active' | 'passive', slotIndex: number, spellIndex: number) => void
  selectedSpells?: {
    activeSpells: number[]
    passiveSpells: number[]
  }
}

function SelectedItem({ name, onSpellSelect, selectedSpells = { activeSpells: [], passiveSpells: [] } }: SelectedItemProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<ItemData | null>(null)

  useEffect(() => {
    async function fetchItemData() {
      if (!name) {
        setData(null)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/items/${name}/data`)
        const data = await response.json()
        
        if ('error' in data) {
          throw new Error(data.error)
        }
        
        setData(data as ItemData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch item data')
      } finally {
        setLoading(false)
      }
    }

    fetchItemData()
  }, [name])

  const handleSpellClick = (type: 'active' | 'passive', slotIndex: number, spellIndex: number) => {
    onSpellSelect?.(type, slotIndex, spellIndex)
  }

  return (
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-[#161B22] rounded border border-zinc-800/50 flex-shrink-0">
        {name && (
          <Image
            src={`https://render.albiononline.com/v1/item/${name}.png`}
            alt={name}
            width={48}
            height={48}
            className="w-full h-full object-contain"
          />
        )}
      </div>
      
      {loading ? (
        <div className="text-sm text-zinc-500 animate-pulse">Loading slots...</div>
      ) : error ? (
        <div className="text-sm text-red-500">{error}</div>
      ) : (
        <div className="flex items-center gap-4">
          {/* Active Spell Slots */}
          {(data?.activeSpellSlots ?? 0) > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex gap-2">
                {Array.from({ length: data?.activeSpellSlots ?? 0 }).map((_, slotIndex) => (
                  <SpellSelectionPopover
                    key={`active-${slotIndex}`}
                    type="active"
                    spells={data?.activeSlots?.[slotIndex + 1] || []}
                    selectedIndex={selectedSpells.activeSpells[slotIndex] ?? -1}
                    isSelected={selectedSpells.activeSpells[slotIndex] !== undefined}
                    onSelect={(spellIndex) => handleSpellClick('active', slotIndex, spellIndex)}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Passive Spell Slots */}
          {(data?.passiveSpellSlots ?? 0) > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex gap-2">
                {Array.from({ length: data?.passiveSpellSlots ?? 0 }).map((_, slotIndex) => (
                  <SpellSelectionPopover
                    key={`passive-${slotIndex}`}
                    type="passive"
                    spells={data?.passiveSlots?.[slotIndex + 1] || []}
                    selectedIndex={selectedSpells.passiveSpells[slotIndex] ?? -1}
                    isSelected={selectedSpells.passiveSpells[slotIndex] !== undefined}
                    onSelect={(spellIndex) => handleSpellClick('passive', slotIndex, spellIndex)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

