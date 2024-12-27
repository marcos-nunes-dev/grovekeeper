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
import { CONTENT_TYPES } from '@/lib/constants'

interface CompositionHeaderProps {
  compositionName: string
  setCompositionName: (name: string) => void
  contentType: string
  setContentType: (contentType: string) => void
  description: string
  setDescription: (description: string) => void
  tags: string[]
  setTags: (tags: string[]) => void
  readOnly?: boolean
}

export default function CompositionHeader({
  compositionName,
  setCompositionName,
  contentType,
  setContentType,
  description,
  setDescription,
  tags,
  setTags,
  readOnly = false
}: CompositionHeaderProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="compositionName" className="mb-2 block text-sm font-medium text-zinc-400">
            Composition Name
          </Label>
          <Input
            id="compositionName"
            value={compositionName}
            onChange={(e) => setCompositionName(e.target.value)}
            placeholder="Enter composition name"
            className="bg-[#161B22] border-zinc-800/50 focus-visible:ring-zinc-700 text-zinc-300"
            readOnly={readOnly}
          />
        </div>

        <div>
          <Label htmlFor="contentType" className="mb-2 block text-sm font-medium text-zinc-400">
            Content Type
          </Label>
          <Select value={contentType} onValueChange={setContentType} disabled={readOnly}>
            <SelectTrigger 
              id="contentType"
              className="w-full h-10 bg-[#161B22] border-zinc-800 text-zinc-300 hover:bg-[#1C2128] focus:ring-zinc-700"
            >
              <SelectValue placeholder="Select Content Type" />
            </SelectTrigger>
            <SelectContent className="bg-[#1C2128] border-zinc-800">
              {CONTENT_TYPES.map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="tags" className="mb-2 block text-sm font-medium text-zinc-400">
            Tags
          </Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="bg-[#00E6B4]/20 text-[#00E6B4] hover:bg-[#00E6B4]/30"
              >
                {tag}
                {!readOnly && (
                  <button
                    onClick={() => setTags(tags.filter((_, i) => i !== index))}
                    className="ml-2 hover:text-destructive"
                  >
                    <X size={12} />
                  </button>
                )}
              </Badge>
            ))}
          </div>
          {!readOnly && (
            <Input
              id="tags"
              placeholder="Add tags..."
              className="bg-[#161B22] border-zinc-800/50 focus-visible:ring-zinc-700 text-zinc-300"
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
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="description" className="mb-2 block text-sm font-medium text-zinc-400">
          Description
        </Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Composition description..."
          className="h-[calc(100%-2rem)] bg-[#161B22] border-zinc-800/50 focus-visible:ring-zinc-700 text-zinc-300 resize-none"
          readOnly={readOnly}
        />
      </div>
    </div>
  )
}

