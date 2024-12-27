'use client'

import { useState, useEffect } from 'react'
import PageHero from '@/components/page-hero'
import Link from 'next/link'
import Image from 'next/image'
import type { Build as CompositionBuild } from '@/lib/types/composition'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDebounce } from '@/lib/hooks/use-debounce'
import { useSession } from 'next-auth/react'

type BuildWithTimestamps = CompositionBuild & {
  createdAt: Date
  updatedAt: Date
  author?: {
    name: string | null
    image: string | null
    email: string | null
  }
}

function BuildCard({ build, isUserBuild = false }: { build: BuildWithTimestamps; isUserBuild?: boolean }) {
  const mainWeapon = build.equipment.mainHand
  const armor = [build.equipment.head, build.equipment.chest, build.equipment.shoes].filter(Boolean)

  return (
    <Link 
      href={`/builds/${build.id}`}
      className="bg-[#0D1117] rounded-lg p-6 border border-zinc-800/50 hover:border-zinc-700/50 transition-colors group relative"
    >
      {isUserBuild && (
        <Link
          href={`/builds/${build.id}/edit`}
          className="absolute top-6 right-6 text-sm text-zinc-500 hover:text-[#00E6B4] transition-colors"
        >
          Edit
        </Link>
      )}
      
      <div className="flex justify-between items-start mb-4 pr-12">
        <div>
          <h3 className="text-lg font-medium text-zinc-200 mb-2 group-hover:text-[#00E6B4] transition-colors">
            {build.name}
          </h3>
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-2">
              {build.author?.image ? (
                <Image 
                  src={build.author.image} 
                  alt={build.author.name || 'Author'} 
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center">
                  <span className="text-xs text-zinc-400">
                    {build.author?.name?.charAt(0) || '?'}
                  </span>
                </div>
              )}
              <span className="text-zinc-400">{build.author?.name || 'Anonymous'}</span>
            </div>
            {isUserBuild && (
              <span className={build.status === 'published' ? 'text-green-400' : 'text-yellow-400'}>
                • {build.status.charAt(0).toUpperCase() + build.status.slice(1)}
              </span>
            )}
          </div>
        </div>
        {mainWeapon && (
          <div className="relative">
            <Image
              src={`https://render.albiononline.com/v1/item/${mainWeapon}.png`}
              alt="Main weapon"
              width={48}
              height={48}
              className="rounded-md"
            />
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-4 text-sm">
          {build.role && (
            <span className="px-2 py-1 bg-zinc-800/50 rounded text-zinc-400">
              {build.role}
            </span>
          )}
          {build.content && (
            <span className="px-2 py-1 bg-zinc-800/50 rounded text-zinc-400">
              {build.content}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {armor.map((item, index) => item && (
              <div key={index} className="w-8 h-8 bg-zinc-800/50 border border-zinc-800 relative">
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
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <span>{new Date(build.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>

        {build.difficulty && build.costTier && (
          <div className="flex items-center gap-2 text-xs text-zinc-500 mt-2">
            <span>{build.difficulty}</span>
            <span>•</span>
            <span>{build.costTier}</span>
          </div>
        )}
      </div>
    </Link>
  )
}

function SearchInput() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(searchParams.get('q') || '')
  
  useDebounce(() => {
    const params = new URLSearchParams(searchParams)
    if (value) {
      params.set('q', value)
    } else {
      params.delete('q')
    }
    router.push(`/builds?${params.toString()}`)
  }, 300, [value])

  return (
    <div className="relative max-w-xl mx-auto">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full pl-10 h-12  border-0 focus-visible:ring-[#00E6B4] text-zinc-300 placeholder:text-zinc-500"
          placeholder="Search builds by name, role, content type..."
        />
      </div>
    </div>
  )
}

export default function Builds() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const [userBuilds, setUserBuilds] = useState<BuildWithTimestamps[]>([])
  const [publicBuilds, setPublicBuilds] = useState<BuildWithTimestamps[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBuilds() {
      setLoading(true)
      try {
        const params = new URLSearchParams(searchParams)
        const response = await fetch(`/api/builds?${params.toString()}`)
        const data = await response.json()

        if (session?.user?.email) {
          setUserBuilds(data.filter((build: BuildWithTimestamps) => 
            build.author?.email === session.user.email
          ))
          setPublicBuilds(data.filter((build: BuildWithTimestamps) => 
            build.author?.email !== session.user.email && build.status === 'published'
          ))
        } else {
          setUserBuilds([])
          setPublicBuilds(data.filter((build: BuildWithTimestamps) => 
            build.status === 'published'
          ))
        }
      } catch (error) {
        console.error('Error fetching builds:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBuilds()
  }, [searchParams, session])

  return (
    <div>
      <PageHero 
        title="Albion Online Builds"
        subtitle="Discover and explore individual builds for every playstyle"
        stats={[
          { value: '500+', label: 'Active Builds' },
          { value: '10K+', label: 'Players Using' }
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
            {userBuilds.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-zinc-200">Your Builds</h2>
                  <Link 
                    href="/builds/create" 
                    className="px-4 py-2 bg-[#00E6B4] hover:bg-[#1BECA0] text-black font-medium rounded-lg transition-colors"
                  >
                    Create Build
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userBuilds.map((build) => (
                    <BuildCard key={build.id} build={build} isUserBuild />
                  ))}
                </div>
              </div>
            )}

            <div>
              <h2 className="text-xl font-semibold text-zinc-200 mb-4">Community Builds</h2>
              {publicBuilds.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {publicBuilds.map((build) => (
                    <BuildCard key={build.id} build={build} />
                  ))}
                </div>
              ) : (
                <div className="text-center text-zinc-500 py-8">
                  No builds found. Try adjusting your search.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
