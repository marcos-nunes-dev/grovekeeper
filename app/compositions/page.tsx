'use client'

import { useState, useEffect } from 'react'
import PageHero from '@/components/page-hero'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDebounce } from '@/lib/hooks/use-debounce'
import type { Build } from '@/lib/types/composition'
import Image from 'next/image'

type CompositionWithAuthor = {
  id: string
  name: string
  contentType: string | null
  description: string | null
  tags: string[]
  createdAt: Date
  updatedAt: Date
  author: {
    name: string | null
    image: string | null
    email: string | null
  }
  _count: {
    classSections: number
  }
  classSections: Array<{
    builds: Array<Pick<Build, 'id' | 'name' | 'class' | 'content' | 'difficulty' | 'costTier'>>
  }>
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
    router.push(`/compositions?${params.toString()}`)
  }, [debouncedValue, router, searchParams])

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
      <Input
        type="text"
        placeholder="Search compositions by name, tags, classes, builds, and more..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full max-w-lg border-0 ml-5"
      />
    </div>
  )
}

function CompositionCard({ composition }: { composition: CompositionWithAuthor }) {
  const totalBuilds = composition.classSections.reduce((acc, section) => acc + section.builds.length, 0)

  return (
    <Link 
      href={`/compositions/${composition.id}`}
      className="bg-[#0D1117] rounded-lg p-6 border border-zinc-800/50 hover:border-zinc-700/50 transition-colors group"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-medium text-zinc-200 mb-2 group-hover:text-[#00E6B4] transition-colors">
            {composition.name}
          </h3>
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-2">
              {composition.author?.image ? (
                <Image 
                  src={composition.author.image} 
                  alt={composition.author.name || 'Author'} 
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center">
                  <span className="text-xs text-zinc-400">
                    {composition.author?.name?.charAt(0) || '?'}
                  </span>
                </div>
              )}
              <span className="text-zinc-400">{composition.author?.name || 'Anonymous'}</span>
            </div>
          </div>
        </div>
      </div>

      {composition.description && (
        <p className="text-sm text-zinc-400 mb-4 line-clamp-2">
          {composition.description}
        </p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {composition.contentType && (
            <span className="px-2 py-1 bg-zinc-800/50 rounded text-sm text-zinc-400">
              {composition.contentType}
            </span>
          )}
          <span className="px-2 py-1 bg-zinc-800/50 rounded text-sm text-zinc-400">
            {totalBuilds} {totalBuilds === 1 ? 'build' : 'builds'}
          </span>
        </div>
        <div className="text-sm text-zinc-500">
          {new Date(composition.updatedAt).toLocaleDateString()}
        </div>
      </div>

      {composition.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {composition.tags.map((tag, index) => (
            <span 
              key={index}
              className="px-2 py-1 bg-[#00E6B4]/20 rounded text-xs text-[#00E6B4]"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  )
}

export default function Compositions() {
  const { data: session } = useSession()
  const [compositions, setCompositions] = useState<CompositionWithAuthor[]>([])
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const search = searchParams?.get('search') || ''

  useEffect(() => {
    const fetchCompositions = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/compositions?search=${search}`)
        if (!response.ok) throw new Error('Failed to fetch compositions')
        const data = await response.json()
        console.log('Session user:', session?.user)
        console.log('Compositions data:', data)
        setCompositions(data)
      } catch (error) {
        console.error('Error fetching compositions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCompositions()
  }, [search, session])

  const userCompositions = compositions.filter(comp => {
    const isOwner = session?.user?.email === comp.author.email
    console.log('Comparing:', {
      userEmail: session?.user?.email,
      authorEmail: comp.author.email,
      isOwner,
      compName: comp.name
    })
    return isOwner
  })

  const communityCompositions = compositions.filter(comp => 
    session?.user?.email !== comp.author.email
  )

  const totalBuilds = compositions.reduce((acc, comp) => 
    acc + comp.classSections.reduce((sectionAcc, section) => 
      sectionAcc + section.builds.length, 0
    ), 0
  )

  return (
    <div>
      <PageHero 
        title="Albion Online Compositions"
        subtitle="Discover and explore team compositions for every content"
        stats={[
          { value: compositions.length, label: 'Compositions' },
          { value: totalBuilds, label: 'Total Builds' }
        ]}
      >
        <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-zinc-800 p-6">
          <SearchInput />
        </div>
      </PageHero>

      <div className="container mx-auto px-4 space-y-8">
        {loading ? (
          <div className="text-center text-zinc-500">Loading compositions...</div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-zinc-200">All Compositions</h2>
              <Link 
                href="/comp/create" 
                className="px-4 py-2 bg-[#00E6B4] hover:bg-[#1BECA0] text-black font-medium rounded-lg transition-colors"
              >
                Create Composition
              </Link>
            </div>

            {session && userCompositions.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-zinc-300">Your Compositions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userCompositions.map((composition) => (
                    <CompositionCard key={composition.id} composition={composition} />
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-zinc-300">Community Compositions</h3>
              {communityCompositions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {communityCompositions.map((composition) => (
                    <CompositionCard key={composition.id} composition={composition} />
                  ))}
                </div>
              ) : (
                <div className="text-center text-zinc-500 py-8">
                  No community compositions found. Try adjusting your search.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
} 