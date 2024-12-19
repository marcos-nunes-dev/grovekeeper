'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'
import RegearResult from '@/components/regear-result'
import PageHero from '@/components/page-hero'
import { getKillboardData } from '@/lib/services/regear'
import type { RegearResult as RegearResultType } from '@/lib/types/regear'

export default function RegearCalculator() {
  const [url, setUrl] = useState('')
  const [result, setResult] = useState<RegearResultType | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCalculate = async () => {
    if (!url.trim()) {
      setError('Please enter a killboard URL')
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      const data = await getKillboardData(url)
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate regear cost')
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHero 
        title="Regear Calculator"
        subtitle="Calculate the cost of regearing your lost equipment"
        stats={[
          { value: '10M+', label: 'Deaths Analyzed' },
          { value: '500B+', label: 'Silver Calculated' }
        ]}
      >
        <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-zinc-800 p-6 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-zinc-400" />
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://albiononline.com/killboard/kill/..."
                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
              />
            </div>
            <div className="h-px bg-zinc-800" />
          </div>

          <Button 
            onClick={handleCalculate} 
            className="w-full bg-[#00E6B4] text-black hover:bg-[#1BECA0]"
            disabled={loading}
          >
            {loading ? 'Calculating...' : 'Calculate Regear'}
          </Button>

          {error && (
            <div className="text-red-400 text-sm mt-2">
              {error}
            </div>
          )}
        </div>
      </PageHero>

      <div className="container mx-auto px-4">
        {result && <RegearResult result={result} />}
      </div>
    </div>
  )
}

