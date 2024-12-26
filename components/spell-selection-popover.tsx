import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { AlbionSpell } from '@/lib/types/composition'
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { parseSpellDescription } from "@/lib/utils"

interface SpellSelectionPopoverProps {
  type: 'active' | 'passive'
  spells: AlbionSpell[]
  selectedIndex: number
  isSelected: boolean
  onSelect: (index: number) => void
}

export function SpellSelectionPopover({ 
  type, 
  spells, 
  selectedIndex,
  isSelected,
  onSelect 
}: SpellSelectionPopoverProps) {
  const selectedSpell = selectedIndex >= 0 ? spells[selectedIndex] : null

  return (
    <Popover>
      <PopoverTrigger>
        <div
          className={cn(
            "w-10 h-10 bg-[#161B22] rounded-full border border-zinc-800/50 hover:border-zinc-600 transition-colors cursor-pointer relative",
            type === 'active' && isSelected && "border-blue-500",
            type === 'passive' && isSelected && "border-yellow-500"
          )}
        >
          <div className={cn(
            "absolute inset-0 rounded-full",
            type === 'active' && "bg-blue-500/10",
            type === 'passive' && "bg-yellow-500/5",
            isSelected && type === 'active' && "bg-blue-500/20",
            isSelected && type === 'passive' && "bg-yellow-500/20"
          )} />
          {selectedSpell && (
            <div className="absolute inset-0 p-1">
              <Image
                src={`https://render.albiononline.com/v1/spell/${selectedSpell.uniqueName}.png`}
                alt={selectedSpell.localizedNames["EN-US"]}
                width={40}
                height={40}
                className="w-full h-full object-contain"
              />
            </div>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-2 bg-[#1C2128] border-zinc-800"
        align="start"
      >
        <div className="grid grid-cols-4 gap-2">
          {spells.map((spell, index) => (
            <Tooltip key={spell.uniqueName} delayDuration={100}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onSelect(index)}
                  className={cn(
                    "p-1 rounded hover:bg-zinc-800/50 transition-colors relative group",
                    selectedIndex === index && "bg-zinc-800"
                  )}
                >
                  <Image
                    src={`https://render.albiononline.com/v1/spell/${spell.uniqueName}.png`}
                    alt={spell.localizedNames["EN-US"]}
                    width={40}
                    height={40}
                    className="w-full"
                  />
                  <div className="text-xs text-zinc-400 mt-1 truncate">
                    {spell.localizedNames["EN-US"]}
                  </div>
                  {selectedIndex === index && (
                    <div className="absolute inset-0 border-2 border-blue-500 rounded pointer-events-none" />
                  )}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-white/5 rounded transition-opacity" />
                </button>
              </TooltipTrigger>
              <TooltipContent 
                side="top" 
                className="max-w-[300px] bg-[#1C2128] border-zinc-800"
                sideOffset={5}
                align="center"
              >
                <div className="space-y-2">
                  <div className="font-medium">{spell.localizedNames["EN-US"]}</div>
                  <div 
                    className="text-sm text-zinc-400"
                    dangerouslySetInnerHTML={{ 
                      __html: parseSpellDescription(spell.localizedDescriptions["EN-US"]) 
                    }} 
                  />
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
} 