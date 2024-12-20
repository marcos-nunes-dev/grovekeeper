'use client'

import { memo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Frown } from 'lucide-react'
import RegearResult from '@/components/regear-result'
import PageHero from '@/components/page-hero'
import { useRegearCalculator } from '@/lib/hooks/useRegearCalculator'
import { AnimatedCounter } from '@/components/animated-counter'

const ErrorDisplay = memo(function ErrorDisplay({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4 text-center">
      <Frown className="w-16 h-16 text-zinc-400" aria-hidden="true" />
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-zinc-300">Something went wrong</h3>
        <p className="text-sm text-zinc-400 max-w-md" role="alert">{message}</p>
      </div>
    </div>
  )
})

export const dynamic = 'force-dynamic'

export default function RegearCalculator() {
  const {
    url,
    result,
    loading,
    error,
    stats,
    setUrl,
    calculate
  } = useRegearCalculator()

  return (
    <div>
      <PageHero 
        title="Regear Calculator"
        subtitle="Calculate the cost of regearing your lost equipment"
        stats={[
          { 
            value: <AnimatedCounter value={stats?.deathsAnalyzed || 0} />, 
            label: 'Deaths Analyzed' 
          },
          { 
            value: <AnimatedCounter value={stats?.silverCalculated || 0} />, 
            label: 'Silver Calculated' 
          }
        ]}
      >
        <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-zinc-800 p-6 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-zinc-400" aria-hidden="true" />
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://albiononline.com/killboard/kill/..."
                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
                aria-label="Killboard URL"
                aria-describedby="url-format-hint"
              />
            </div>
            <div className="h-px bg-zinc-800" />
          </div>

          <Button 
            onClick={calculate} 
            className="w-full bg-[#00E6B4] text-black hover:bg-[#1BECA0]"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? 'Calculating...' : 'Calculate Regear'}
          </Button>
        </div>
      </PageHero>

      <div id="url-format-hint" className="sr-only">
        Enter a valid Albion Online killboard URL
      </div>

      <div className="container mx-auto px-4" role="region" aria-live="polite">
        {error ? (
          <ErrorDisplay message={error} />
        ) : result ? (
          <RegearResult result={result} />
        ) : null}
      </div>
    </div>
  )
}

