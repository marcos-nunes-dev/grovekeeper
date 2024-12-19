import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Search from '@/components/search'

export default function TopBar() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 border-b bg-[#0D1117] border-zinc-800">
      <div className="flex items-center h-14 px-4 gap-4 max-w-[1920px] mx-auto">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Image
            src="/bg_castle.jpeg"
            alt="Grovekeeper"
            width={24}
            height={24}
            className="w-6 h-6"
          />
          GROVEKEEPER
        </Link>
        
        <div className="flex-1 w-full ml-8">
          <Search />
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <Button variant="ghost" className="text-zinc-400 hover:text-white">
            English
          </Button>
          <Button asChild className="bg-[#00E6B4] text-black hover:bg-[#1BECA0] font-semibold">
            <Link href="/comp/create">
              Create
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

