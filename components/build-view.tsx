'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Build } from '@/lib/types/composition'
import type { ItemData } from '@/lib/types/composition'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { SpellSelectionPopover } from './spell-selection-popover'

interface BuildViewProps {
  build: Build & {
    author: {
      name: string | null
      image: string | null
      email: string | null
    }
  }
  isAuthor?: boolean
}

export default function BuildView({ build, isAuthor }: BuildViewProps) {
  const mainHand = build.equipment.mainHand
  const head = build.equipment.head
  const chest = build.equipment.chest
  const shoes = build.equipment.shoes
  const cape = build.equipment.cape
  const offHand = build.equipment.offHand
  const potion = build.equipment.potion
  const food = build.equipment.food
  const mount = build.equipment.mount

  const stats = [
    { label: 'Role', value: build.role || 'Not specified' },
    { label: 'Content', value: build.content || 'Not specified' },
    { label: 'Difficulty', value: build.difficulty || 'Not specified' },
    { label: 'Cost', value: build.costTier || 'Not specified' },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-[#0D1117] rounded-lg p-6 border border-zinc-800">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-semibold text-zinc-200">{build.name}</h1>
            {build.author.image && (
              <div className="flex items-center gap-2">
                <img 
                  src={build.author.image} 
                  alt={build.author.name || 'Author'} 
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-zinc-400">{build.author.name}</span>
              </div>
            )}
          </div>
          {isAuthor && (
            <Link 
              href={`/builds/${build.id}/edit`}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg transition-colors"
            >
              Edit Build
            </Link>
          )}
        </div>

        <div className="grid grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-black/20 rounded-lg p-4">
              <div className="text-sm text-zinc-400 mb-1">{stat.label}</div>
              <div className="text-zinc-200">{stat.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Equipment */}
      <div className="bg-[#0D1117] rounded-lg p-6 border border-zinc-800">
        <h2 className="text-lg font-semibold text-zinc-200 mb-6">Equipment</h2>
        <div className="grid grid-cols-3 gap-8">
          {/* Main Equipment */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-zinc-400">Main Equipment</h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { slot: 'Head', item: head },
                { slot: '', item: null },
                { slot: 'Cape', item: cape },
                { slot: 'Weapon', item: mainHand },
                { slot: 'Armor', item: chest },
                { slot: 'Off-hand', item: offHand },
                { slot: 'Potion', item: potion },
                { slot: 'Shoes', item: shoes },
                { slot: 'Food', item: food },
                { slot: '', item: null },
                { slot: 'Mount', item: mount },
                { slot: '', item: null },
              ].map((slot, index) => (
                <div
                  key={index}
                  className={cn(
                    "aspect-square rounded border p-1 relative",
                    slot.slot 
                      ? "border-zinc-800 bg-[#161B22]" 
                      : "border-transparent bg-transparent"
                  )}
                >
                  {slot.item && (
                    <Image
                      src={`https://render.albiononline.com/v1/item/${slot.item}.png`}
                      alt={slot.slot}
                      width={48}
                      height={48}
                      className="w-full h-full object-contain"
                    />
                  )}
                  {slot.slot && !slot.item && (
                    <div className="absolute top-1 left-1 text-xs font-medium text-zinc-500">
                      {slot.slot}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Spells */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-zinc-400">Spells</h3>
            <div className="space-y-4">
              {[mainHand, head, chest, shoes].map((item) => item && (
                <SelectedItem
                  key={item}
                  name={item}
                  selectedSpells={
                    build.spells?.[item] || { activeSpells: [], passiveSpells: [] }
                  }
                  readOnly
                />
              ))}
            </div>
          </div>

          {/* Swaps */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-zinc-400">Swaps</h3>
            <div className="space-y-4">
              {build.swaps?.map((swap) => (
                <div 
                  key={swap.id}
                  className="flex gap-4 p-4 bg-[#161B22] rounded-lg border border-zinc-800/50"
                >
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-[#161B22] rounded border border-zinc-800/50 flex items-center justify-center">
                      {swap.itemId && (
                        <Image
                          src={`https://render.albiononline.com/v1/item/${swap.itemId}.png`}
                          alt={swap.itemId}
                          width={48}
                          height={48}
                          className="w-full h-full object-contain"
                        />
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-zinc-300">{swap.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      {build.instructions && (
        <div className="bg-[#0D1117] rounded-lg p-6 border border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-200 mb-4">How to Play</h2>
          <div className="text-zinc-300 whitespace-pre-wrap">{build.instructions}</div>
        </div>
      )}
    </div>
  )
}

interface SelectedItemProps {
  name: string
  selectedSpells: {
    activeSpells: number[]
    passiveSpells: number[]
  }
  readOnly?: boolean
}

function SelectedItem({ name, selectedSpells, readOnly = false }: SelectedItemProps) {
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
                    readOnly={readOnly}
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
                    readOnly={readOnly}
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