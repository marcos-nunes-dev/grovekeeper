import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import { PURPOSES } from '@/lib/constants'

interface CompositionHeaderProps {
  compositionName: string
  setCompositionName: (name: string) => void
  purpose: string
  setPurpose: (purpose: string) => void
  description: string
  setDescription: (description: string) => void
  tags: string[]
  setTags: (tags: string[]) => void
}

export default function CompositionHeader({
  compositionName,
  setCompositionName,
  purpose,
  setPurpose,
  description,
  setDescription,
  tags,
  setTags,
}: CompositionHeaderProps) {
  return (
    <div className="bg-[#0D1117] border border-zinc-800/50 rounded-lg p-6 shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="compositionName">Composition Name</Label>
            <Input
              id="compositionName"
              value={compositionName}
              onChange={(e) => setCompositionName(e.target.value)}
              placeholder="Enter composition name"
            />
          </div>
          <div>
            <Label htmlFor="purpose">Purpose</Label>
            <Select value={purpose} onValueChange={setPurpose}>
              <SelectTrigger>
                <SelectValue placeholder="Select Purpose" />
              </SelectTrigger>
              <SelectContent>
                {PURPOSES.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="tags">Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="bg-[#00E6B4]/20 text-[#00E6B4] hover:bg-[#00E6B4]/30">
                  {tag}
                  <button
                    onClick={() => setTags(tags.filter((_, i) => i !== index))}
                    className="ml-2 hover:text-destructive"
                  >
                    <X size={12} />
                  </button>
                </Badge>
              ))}
            </div>
            <Input
              id="tags"
              placeholder="Add tags..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const input = e.target as HTMLInputElement
                  if (input.value) {
                    setTags([...tags, input.value])
                    input.value = ''
                  }
                }
              }}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Composition description..."
            className="h-[calc(100%-1.5rem)]"
          />
        </div>
      </div>
    </div>
  )
}

