import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Eye, ThumbsUp } from 'lucide-react'
import { CLASSES, PURPOSES } from '@/lib/constants'

const mockCompositions = [
  {
    id: 1,
    title: 'ZvZ Frontline Composition',
    author: 'AlbionMaster',
    classes: ['Tank', 'Healer', 'DPS', 'Support', 'Ranged DPS'],
    likes: 1200,
    views: 5000,
    type: 'ZvZ',
  },
  {
    id: 2,
    title: 'Small Group Ganking',
    author: 'ShadowHunter',
    classes: ['Assassin', 'Crowd Control', 'Healer', 'Scout'],
    likes: 800,
    views: 3500,
    type: 'Small Scale',
  },
  {
    id: 3,
    title: 'Avalonian Dungeon Speedrun',
    author: 'DungeonMaster',
    classes: ['Tank', 'Healer', 'AoE DPS', 'Single Target DPS', 'Support'],
    likes: 1500,
    views: 6000,
    type: 'PvE',
  },
]

export default function CompositionResults() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {mockCompositions.map((comp) => (
        <Card key={comp.id} className="overflow-hidden bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/80 backdrop-blur">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-white">{comp.title}</h3>
              <Badge className="bg-[#00E6B4] hover:bg-[#1BECA0] text-black">
                {comp.type}
              </Badge>
            </div>
            <p className="mb-3 text-sm text-zinc-400">By {comp.author}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {comp.classes.map((cls, index) => (
                <Badge key={index} variant="secondary" className="bg-zinc-800 text-zinc-300">
                  {cls}
                </Badge>
              ))}
            </div>
            <div className="flex items-center justify-between text-sm text-zinc-400">
              <div className="flex items-center">
                <ThumbsUp className="w-4 h-4 mr-1" />
                {comp.likes.toLocaleString()}
              </div>
              <div className="flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                {comp.views.toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

