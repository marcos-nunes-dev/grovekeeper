'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import PageHero from '@/components/page-hero'
import { Input } from '@/components/ui/input'
import { Link2, Search } from 'lucide-react'
import { useDebounce } from '@/lib/hooks/use-debounce'
import Image from 'next/image'

interface Build {
  id: string
  name: string
  class: string | null
  content: string | null
  instructions: string | null
  status: string
  equipment: {
    mainHand: string | null
    offHand: string | null
    head: string | null
    chest: string | null
    shoes: string | null
  }
  author: {
    name: string | null
    image: string | null
    email: string | null
  }
  classSection?: {
    composition: {
      id: string
      name: string
      contentType: string | null
    }
  }
  updatedAt: string
}

function SearchInput() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(searchParams?.get('search') || '')
  const debouncedValue = useDebounce(value, 500, false)

  useEffect(() => {
    const params = new URLSearchParams(searchParams?.toString())
    if (debouncedValue && debouncedValue.length > 0) {
      params.set('search', debouncedValue)
    } else {
      params.delete('search')
    }
    router.push(`/builds?${params.toString()}`)
  }, [debouncedValue, router, searchParams])

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="pl-9 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        placeholder="Search builds..."
      />
    </div>
  )
}

function BuildCard({ build }: { build: Build }) {
  const mainWeapon = build.equipment.mainHand
  const armor = [build.equipment.head, build.equipment.chest, build.equipment.shoes].filter(Boolean)

  return (
    <Link 
      href={`/builds/${build.id}`}
      className="bg-[#0D1117] rounded-lg p-5 border border-zinc-800/50 hover:border-zinc-700/50 transition-colors group flex gap-6"
    >
      <div className="flex-shrink-0 flex flex-col gap-3">
        {mainWeapon && (
          <div className="w-14 h-14 bg-zinc-800/50 rounded-md p-1.5 relative group-hover:bg-zinc-800/70 transition-colors">
            <Image
              src={`https://render.albiononline.com/v1/item/${mainWeapon}.png`}
              alt="Main weapon"
              width={56}
              height={56}
              className="w-full h-full object-contain"
            />
          </div>
        )}
        <div className="flex">
          {armor.map((item, index) => item && (
            <div 
              key={index} 
              className="w-8 h-8 bg-zinc-800/50 rounded-md p-1 relative group-hover:bg-zinc-800/70 transition-colors -ml-2 first:ml-0 border border-[#0D1117]"
              style={{ zIndex: armor.length - index }}
            >
              <Image
                src={`https://render.albiononline.com/v1/item/${item}.png`}
                alt={`Armor piece ${index + 1}`}
                width={32}
                height={32}
                className="w-full h-full object-contain"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex-grow min-w-0 flex flex-col">
        <div className="flex items-center justify-between gap-4 mb-2">
          <h3 className="text-lg font-medium text-zinc-200 truncate group-hover:text-[#00E6B4] transition-colors">
            {build.name}
          </h3>
          <div className="flex items-center gap-2 flex-shrink-0">
            {build.class && (
              <span className="px-2 py-1 bg-zinc-800/50 rounded text-sm text-zinc-400">
                {build.class}
              </span>
            )}
            {build.content && (
              <span className="px-2 py-1 bg-zinc-800/50 rounded text-sm text-zinc-400">
                {build.content}
              </span>
            )}
          </div>
        </div>

        {build.instructions && (
          <p className="text-sm text-zinc-400 mb-3 line-clamp-2">
            {build.instructions}
          </p>
        )}

        <div className="mt-auto space-y-2">
          <div className="flex items-center gap-2">
            {build.author?.image ? (
              <Image 
                src={build.author.image} 
                alt={build.author.name || 'Author'} 
                width={24}
                height={24}
                className="w-6 h-6 rounded-full"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center">
                <span className="text-xs text-zinc-400">
                  {build.author?.name?.charAt(0) || '?'}
                </span>
              </div>
            )}
            <span className="text-sm text-zinc-400">{build.author?.name || 'Anonymous'}</span>
            <span className="text-sm text-zinc-500 ml-auto">
              {new Date(build.updatedAt).toLocaleDateString()}
            </span>
          </div>

          {build.classSection?.composition && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-zinc-500 flex items-center gap-1">
                <Link2 className="w-4 h-4" />
              </span>
              <Link 
                href={`/compositions/${build.classSection.composition.id}`}
                className="text-[#00E6B4] hover:underline truncate"
                onClick={(e) => e.stopPropagation()}
              >
                {build.classSection.composition.name}
              </Link>
              {build.classSection.composition.contentType && (
                <span className="text-zinc-500">
                  ({build.classSection.composition.contentType})
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

export default function Builds() {
  const { data: session } = useSession()
  const [builds, setBuilds] = useState<Build[]>([])
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const search = searchParams?.get('search') || ''

  useEffect(() => {
    const fetchBuilds = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/builds?search=${search}`)
        if (!response.ok) throw new Error('Failed to fetch builds')
        const data = await response.json()
        setBuilds(data)
      } catch (error) {
        console.error('Error fetching builds:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBuilds()
  }, [search])

  const userBuilds = builds.filter(build => 
    session?.user?.email === build.author.email
  )

  const communityBuilds = builds.filter(build => 
    session?.user?.email !== build.author.email
  )

  return (
    <div>
      <PageHero 
        title="Albion Online Builds"
        subtitle="Discover and explore builds for every content"
        stats={[
          { value: builds.length, label: 'Builds' }
        ]}
      >
        <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-zinc-800 p-6">
          <SearchInput />
        </div>
      </PageHero>

      <div className="container mx-auto px-4 space-y-8">
        {loading ? (
          <div className="text-center text-zinc-500">Loading builds...</div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-zinc-200">All Builds</h2>
              <Link 
                href="/builds/create" 
                className="px-4 py-2 bg-[#00E6B4] hover:bg-[#1BECA0] text-black font-medium rounded-lg transition-colors"
              >
                Create Build
              </Link>
            </div>

            {session && userBuilds.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-zinc-300">Your Builds</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userBuilds.map((build) => (
                    <BuildCard key={build.id} build={build} />
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-zinc-300">Community Builds</h3>
              {communityBuilds.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {communityBuilds.map((build) => (
                    <BuildCard key={build.id} build={build} />
                  ))}
                </div>
              ) : (
                <div className="text-center text-zinc-500 py-8">
                  No community builds found. Try adjusting your search.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
