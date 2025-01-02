'use client'

import { memo, useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Frown, Users2, HelpCircle, ChevronDown, Sparkles } from 'lucide-react'
import RegearResult from '@/components/regear-result'
import PageHero from '@/components/page-hero'
import { useRegearCalculator } from '@/lib/hooks/useRegearCalculator'
import { isValidKillboardUrl, extractKillIds } from '@/lib/utils/url'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import GroupRegearResult from '@/components/group-regear-result'

type RegearMode = 'individual' | 'group'

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
    setUrl,
    calculate,
    calculateGroup,
    groupResult
  } = useRegearCalculator()
  const [mode, setMode] = useState<RegearMode>('individual')
  const [tooltipOpen, setTooltipOpen] = useState(false)
  const [proTipOpen, setProTipOpen] = useState(false)

  const handleProTipClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setProTipOpen(!proTipOpen)
  }

  const urlValidation = useMemo(() => {
    if (!url.trim()) {
      return { isValid: false, message: 'Enter a killboard URL' }
    }

    if (mode === 'individual') {
      return {
        isValid: isValidKillboardUrl(url),
        message: isValidKillboardUrl(url) ? 'Calculate Regear' : 'Invalid killboard URL'
      }
    } else {
      const killIds = extractKillIds(url)
      return {
        isValid: killIds.length > 0,
        message: killIds.length > 0 
          ? `Calculate Regear (${killIds.length} ${killIds.length === 1 ? 'URL' : 'URLs'} found)`
          : 'No valid killboard URLs found'
      }
    }
  }, [url, mode])

  const handleCalculate = () => {
    if (!urlValidation.isValid) return
    if (mode === 'group') {
      calculateGroup()
    } else {
      calculate()
    }
  }

  return (
    <div>
      <PageHero 
        title="Regear Calculator"
        subtitle="Calculate the cost of regearing your lost equipment"
      >
        <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-zinc-800 p-6 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button 
                    type="button"
                    className="flex h-9 items-center justify-between gap-2 rounded-md bg-transparent py-2 text-sm font-medium shadow-sm hover:bg-zinc-800/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-700 disabled:pointer-events-none disabled:opacity-50 min-w-[140px]"
                  >
                    <div className="flex items-center gap-2">
                      <Users2 className="w-4 h-4" />
                      <span>{mode === 'individual' ? 'Individual' : 'Group'}</span>
                    </div>
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 15 15"
                      fill="none"
                      className="h-4 w-4 opacity-50"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4.93179 5.43179C4.75605 5.60753 4.75605 5.89245 4.93179 6.06819L7.43179 8.56819C7.60753 8.74392 7.89245 8.74392 8.06819 8.56819L10.5682 6.06819C10.7439 5.89245 10.7439 5.60753 10.5682 5.43179C10.3924 5.25605 10.1075 5.25605 9.93177 5.43179L7.75 7.61356L5.56823 5.43179C5.39249 5.25605 5.10753 5.25605 4.93179 5.43179Z"
                        fill="currentColor"
                        fillRule="evenodd"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[140px]">
                  <DropdownMenuItem onClick={() => setMode('individual')}>
                    Individual
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setMode('group')}>
                    Group
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="flex-1 flex items-center gap-2">
                <Search className="w-5 h-5 text-zinc-400" aria-hidden="true" />
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder={mode === 'individual' 
                    ? "https://albiononline.com/killboard/kill/..." 
                    : "Paste your list of URLs here..."
                  }
                  className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
                  aria-label="Killboard URL"
                  aria-describedby="url-format-hint"
                />
                {mode === 'group' && (
                  <Tooltip open={tooltipOpen}>
                    <TooltipTrigger asChild onClick={() => setTooltipOpen(!tooltipOpen)}>
                      <button 
                        type="button" 
                        className="inline-flex items-center justify-center rounded-full hover:bg-zinc-800/50 p-0.5 transition-colors"
                      >
                        <HelpCircle className="w-5 h-5 text-zinc-400" />
                        <span className="sr-only">URL format help</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent 
                      side="top" 
                      className="max-w-[350px] p-4 space-y-4"
                      onPointerDownOutside={(e) => {
                        if (e.target instanceof Element && e.target.closest('[role="tooltip"]')) {
                          e.preventDefault()
                          return
                        }
                        setTooltipOpen(false)
                      }}
                      onEscapeKeyDown={() => setTooltipOpen(false)}
                    >
                      <div className="relative">
                        <button
                          onClick={() => setTooltipOpen(false)}
                          className="absolute -top-2 -right-2 p-1 rounded-full hover:bg-zinc-800/50 transition-colors"
                        >
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 15 15"
                            fill="none"
                            className="w-4 h-4 text-zinc-400"
                          >
                            <path
                              d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
                              fill="currentColor"
                              fillRule="evenodd"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="sr-only">Close</span>
                        </button>
                        <p>Copy and paste the list of URLs. Don&apos;t worry with random/dirty text, we gonna handle just albion URLs and ignore the rest</p>
                        <div className="h-px bg-zinc-800/50 my-4" />
                        <Collapsible open={proTipOpen} onOpenChange={setProTipOpen}>
                          <CollapsibleTrigger 
                            onClick={handleProTipClick}
                            className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-zinc-300 w-full group"
                          >
                            <div className="flex items-center gap-2 flex-1">
                              <Sparkles className="w-4 h-4 text-amber-400" />
                              <span className="group-hover:text-amber-400 transition-colors">Pro tip</span>
                            </div>
                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${proTipOpen ? 'rotate-180' : ''}`} />
                          </CollapsibleTrigger>
                          <CollapsibleContent className="pt-3 text-sm text-zinc-400 pl-6">
                            Create a regear channel in your guild&apos;s Discord. When players die, ask them to post their death URL along with the screenshot (Discord&apos;s default behavior). This way, you can simply copy everything - screenshots, usernames, links, etc. - and paste it here. We&apos;ll automatically extract and process just the death links.
                          </CollapsibleContent>
                        </Collapsible>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
            <div className="h-px bg-zinc-800" />
          </div>

          <Button 
            onClick={handleCalculate} 
            className="w-full bg-[#00E6B4] text-black hover:bg-[#1BECA0] disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || !urlValidation.isValid}
            aria-busy={loading}
          >
            {loading ? 'Calculating...' : urlValidation.message}
          </Button>
        </div>
      </PageHero>

      <div id="url-format-hint" className="sr-only">
        Enter a valid Albion Online killboard URL
      </div>

      <div className="container mx-auto px-4" role="region" aria-live="polite">
        {error ? (
          <ErrorDisplay message={error} />
        ) : mode === 'group' ? (
          groupResult && <GroupRegearResult result={groupResult} />
        ) : (
          result && <RegearResult result={result} />
        )}
      </div>
    </div>
  )
}

