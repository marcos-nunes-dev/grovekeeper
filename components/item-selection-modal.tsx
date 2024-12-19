import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AlbionItem, albionItems } from '@/lib/albion-items'

interface ItemSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (item: AlbionItem) => void
  selectedSlot: string | null
}

export default function ItemSelectionModal({
  isOpen,
  onClose,
  onSelect,
  selectedSlot,
}: ItemSelectionModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredItems, setFilteredItems] = useState<AlbionItem[]>([])

  useEffect(() => {
    const filtered = albionItems.filter((item) =>
      item.slot === selectedSlot &&
      (item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       item.id.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    setFilteredItems(filtered)
  }, [searchTerm, selectedSlot])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select {selectedSlot} Item</DialogTitle>
        </DialogHeader>
        <Input
          placeholder="Search items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4"
        />
        <ScrollArea className="h-[300px] w-full rounded-md border p-4">
          <div className="grid grid-cols-3 gap-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-col items-center cursor-pointer hover:bg-zinc-800 rounded p-2"
                onClick={() => onSelect(item)}
              >
                <img
                  src={`https://render.albiononline.com/v1/item/${item.itemType}.png`}
                  alt={item.name}
                  className="w-12 h-12 object-contain mb-2"
                />
                <span className="text-xs text-center">{item.name}</span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

