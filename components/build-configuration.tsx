import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AlbionItem } from '@/lib/albion-items'
import Image from 'next/image'
import ItemSelectionModal from './item-selection-modal'

interface BuildConfigurationProps {
  build: Build
  buildIndex: number
  updateBuild: (updatedBuild: Build) => void
  removeBuild?: () => void // Make this optional
  showDismissible?: boolean // New prop to determine if the dismissible option should be shown
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

export default function BuildConfiguration({
  build,
  buildIndex,
  updateBuild,
  removeBuild,
  showDismissible = false, // Default to false
}: BuildConfigurationProps) {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const updateBuildName = (newName: string) => {
    updateBuild({ ...build, name: newName })
  }

  const updateInstructions = (newInstructions: string) => {
    updateBuild({ ...build, instructions: newInstructions })
  }

  const handleTileClick = (slot: string) => {
    setSelectedSlot(slot)
    setIsModalOpen(true)
  }

  const handleItemSelect = (item: AlbionItem) => {
    if (selectedSlot) {
      const updatedEquipment = { ...build.equipment, [selectedSlot]: item.id }
      updateBuild({ ...build, equipment: updatedEquipment })
      setIsModalOpen(false)
    }
  }

  return (
    <div className="bg-[#161B22] rounded-lg p-6 border border-zinc-800/50 hover:border-zinc-700/50 transition-colors">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Input
            value={build.name}
            onChange={(e) => updateBuildName(e.target.value)}
            className="px-3 py-1 bg-[#1C2128] border-zinc-800/50"
          />
          <span className="text-xs text-zinc-500 px-2 py-1 bg-[#1C2128] rounded-md">
            Build {buildIndex + 1}
          </span>
        </div>
        {showDismissible && removeBuild && (
          <button
            onClick={removeBuild}
            className="text-zinc-400 hover:text-zinc-300 transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="flex gap-8 mb-6">
        {/* Available Items Grid */}
        <div id="build-setup" className="flex-1 flex flex-col gap-4">
          <Label htmlFor={`build-${build.id}`} className="mb-2 block text-sm font-medium text-zinc-300">
            Items assignment build
          </Label>
          <div className="flex gap-4 h-[400px]">
            <div className="w-64">
              <div className="grid grid-cols-3 gap-2">
                {slotAssignments.map((slot) => (
                  <div
                    key={slot.index}
                    className={cn(
                      "aspect-square rounded border border-zinc-800/50 p-1 relative cursor-pointer",
                      "bg-[#1C2128] hover:bg-[#252D38] transition-colors"
                    )}
                    onClick={() => slot.name && handleTileClick(slot.name)}
                  >
                    {build.equipment[slot.name] && (
                      <Image
                        src={`https://render.albiononline.com/v1/item/${build.equipment[slot.name]}.png`}
                        alt={slot.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-contain"
                      />
                    )}
                    <div className="absolute top-1 left-1 text-xs font-medium text-zinc-500">
                      {slot.name}
                    </div>
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
              {['mainHand', 'head', 'chest', 'shoes'].map((slot) => (
                <SelectedItem
                  key={slot}
                  name={build.equipment[slot] || ''}
                  skills={slot === 'mainHand' ? 3 : 1}
                  hasPassive={true}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Instructions Field */}
        <div className="w-1/2 flex flex-col">
          <Label htmlFor={`instructions-${build.id}`} className="mb-2 block text-sm font-medium text-zinc-300">
            How to play this build
          </Label>
          <Textarea
            id={`instructions-${build.id}`}
            value={build.instructions || ''}
            onChange={(e) => updateInstructions(e.target.value)}
            placeholder="Enter instructions on how to play this build..."
            className="flex-1 w-full bg-[#1C2128] border-zinc-800/50 text-zinc-300 placeholder-zinc-500 resize-none"
          />
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
  skills: number
  hasPassive?: boolean
}

function SelectedItem({ name, skills, hasPassive }: SelectedItemProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-[#1C2128] rounded border border-zinc-800/50 flex-shrink-0">
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
      <div className="flex items-center gap-2">
        {Array.from({ length: skills }).map((_, index) => (
          <div
            key={index}
            className="w-10 h-10 bg-[#1C2128] rounded-full border border-zinc-800/50"
          />
        ))}
        {hasPassive && (
          <div className="w-10 h-10 bg-[#1C2128] rounded-full border border-zinc-800/50" />
        )}
      </div>
    </div>
  )
}

