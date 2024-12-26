import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { AlbionSpell } from '@/lib/types/composition'

interface SpellSelectionPopoverProps {
  type: 'active' | 'passive'
  spells: AlbionSpell[]
  selectedIndex: number
  isSelected: boolean
  onSelect?: (index: number) => void
  readOnly?: boolean
}

export function SpellSelectionPopover({ 
  type, 
  spells, 
  selectedIndex,
  isSelected,
  onSelect,
  readOnly = false 
}: SpellSelectionPopoverProps) {
  const selectedSpell = spells[selectedIndex]

  return (
    <Popover>
      <PopoverTrigger disabled={readOnly}>
        <div className={cn(
          "w-10 h-10 rounded border flex items-center justify-center relative",
          isSelected 
            ? "bg-[#161B22] border-zinc-800" 
            : "bg-zinc-800/20 border-transparent",
          !readOnly && "hover:bg-[#252D38] cursor-pointer transition-colors"
        )}>
          {selectedSpell && (
            <Image
              src={`https://render.albiononline.com/v1/spell/${selectedSpell.uniqueName}.png`}
              alt={selectedSpell.localizedNames['EN-US']}
              width={32}
              height={32}
              className="w-8 h-8 object-contain"
            />
          )}
          <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-zinc-800 flex items-center justify-center">
            <div className={cn(
              "w-2 h-2 rounded-full",
              type === 'active' ? "bg-blue-400" : "bg-yellow-400"
            )} />
          </div>
        </div>
      </PopoverTrigger>
      {!readOnly && (
        <PopoverContent className="w-64 p-2 bg-[#1C2128] border-zinc-800">
          <div className="grid grid-cols-3 gap-2">
            {spells.map((spell, index) => (
              <button
                key={spell.uniqueName}
                onClick={() => onSelect?.(index)}
                className={cn(
                  "w-full aspect-square rounded border p-1",
                  selectedIndex === index
                    ? "bg-[#252D38] border-zinc-700"
                    : "bg-[#161B22] border-zinc-800 hover:bg-[#252D38] hover:border-zinc-700"
                )}
              >
                <Image
                  src={`https://render.albiononline.com/v1/spell/${spell.uniqueName}.png`}
                  alt={spell.localizedNames['EN-US']}
                  width={32}
                  height={32}
                  className="w-full h-full object-contain"
                />
              </button>
            ))}
          </div>
        </PopoverContent>
      )}
    </Popover>
  )
} 