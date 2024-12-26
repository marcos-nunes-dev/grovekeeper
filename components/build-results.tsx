import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Eye, ThumbsUp } from 'lucide-react'
import Image from 'next/image'

const mockBuilds = [
  {
    id: 1,
    name: 'Bloodletter Ganking Build',
    author: 'AlbionMaster',
    weapon: 'Bloodletter',
    role: 'DPS',
    likes: 800,
    views: 3500,
    equipment: {
      mainHand: 'T8_MAIN_DAGGER',
      offHand: 'T8_OFF_SHIELD',
      head: 'T8_HEAD_LEATHER',
      chest: 'T8_ARMOR_LEATHER',
      shoes: 'T8_SHOES_LEATHER',
      cape: 'T8_CAPE',
    }
  },
  {
    id: 2,
    name: 'Great Holy Healer',
    author: 'HealerPro',
    weapon: 'Great Holy Staff',
    role: 'Healer',
    likes: 1200,
    views: 5000,
    equipment: {
      mainHand: 'T8_2H_HOLYSTAFF',
      head: 'T8_HEAD_CLOTH',
      chest: 'T8_ARMOR_CLOTH',
      shoes: 'T8_SHOES_CLOTH',
      cape: 'T8_CAPE',
    }
  },
  {
    id: 3,
    name: 'Kingmaker Tank',
    author: 'TankMaster',
    weapon: 'Mace',
    role: 'Tank',
    likes: 1500,
    views: 6000,
    equipment: {
      mainHand: 'T8_MAIN_MACE',
      offHand: 'T8_OFF_SHIELD',
      head: 'T8_HEAD_PLATE',
      chest: 'T8_ARMOR_PLATE',
      shoes: 'T8_SHOES_PLATE',
      cape: 'T8_CAPE',
    }
  },
]

export default function BuildResults() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 py-8">
      {mockBuilds.map((build) => (
        <Card key={build.id} className="overflow-hidden bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/80 backdrop-blur">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-white">{build.name}</h3>
              <Badge className="bg-[#00E6B4] hover:bg-[#1BECA0] text-black">
                {build.role}
              </Badge>
            </div>
            <p className="mb-3 text-sm text-zinc-400">By {build.author}</p>
            
            <div className="grid grid-cols-6 gap-2 mb-4">
              {Object.entries(build.equipment).map(([slot, item]) => (
                <div key={slot} className="aspect-square bg-zinc-900 rounded border border-zinc-800">
                  <Image
                    src={`https://render.albiononline.com/v1/item/${item}.png`}
                    alt={slot}
                    width={48}
                    height={48}
                    className="w-full h-full object-contain"
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-sm text-zinc-400">
              <div className="flex items-center">
                <ThumbsUp className="w-4 h-4 mr-1" />
                {build.likes.toLocaleString()}
              </div>
              <div className="flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                {build.views.toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
