'use client'

import { motion } from 'framer-motion'
import { ChevronDown, Users2, Sparkles, HelpCircle, SearchIcon, Shield, Swords, HandHelping, Skull, Clock, Info, ExternalLink } from 'lucide-react'
import RegearResultComponent from '@/components/regear-result'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { RegearResult } from '@/lib/types/regear'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import Image from "next/image"

// Mock data for examples
const MOCK_REGEAR_RESULT: RegearResult = {
  equipped: [
    {
      id: 'T4_HEAD_LEATHER_SET1',
      name: 'Mercenary Hood',
      value: 25000,
      formattedValue: '25K',
      quality: 1,
      count: 1,
      isReliablePrice: true,
      priceHistory: []
    },
    {
      id: 'T4_ARMOR_LEATHER_SET1',
      name: 'Mercenary Jacket',
      value: 35000,
      formattedValue: '35K',
      quality: 1,
      count: 1,
      isReliablePrice: true,
      priceHistory: []
    }
  ],
  bag: [
    {
      id: 'T4_POTION_HEAL',
      name: 'Minor Healing Potion',
      value: 1000,
      formattedValue: '1K',
      quality: 1,
      count: 3,
      isReliablePrice: true,
      priceHistory: []
    }
  ],
  total: {
    value: 63000,
    formatted: '63K'
  }
}

const DOCS_SECTIONS = [
  {
    id: 'regear-calculator',
    title: 'Regear Calculator',
    subsections: [
      { id: 'core-features', title: 'Core Features' },
      { id: 'how-it-works', title: 'How It Works' },
      { id: 'advanced-features', title: 'Advanced Features' },
      { id: 'group-filters', title: 'Group Filters' },
      { id: 'pro-tips', title: 'Pro Tips' }
    ]
  },
  {
    id: 'attendance',
    title: 'Attendance',
    subsections: [
      { id: 'tracking-features', title: 'Core Features' },
      { id: 'tier-system', title: 'Tier System' },
      { id: 'tracking', title: 'Tracking Features' },
      { id: 'reports', title: 'Performance Reports' }
    ]
  },
  {
    id: 'profile',
    title: 'Player Profile',
    subsections: [
      { id: 'profile-features', title: 'Core Features' },
      { id: 'player-search', title: 'Player Search' },
      { id: 'profile-overview', title: 'Profile Overview' },
      { id: 'zvz-performance', title: 'ZvZ Performance' },
      { id: 'recent-activities', title: 'Recent Activities' },
      { id: 'profile-info', title: 'Profile Info Widget' },
      { id: 'guild-history', title: 'Guild History & Deep Search' }
    ]
  }
]

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-[#0D1117]">
      <div className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 w-full h-full">
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E14] via-[#0D1117]/50 to-transparent" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <motion.h1 
              className="text-5xl md:text-7xl font-bold mb-6 tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Documentation
            </motion.h1>
            <motion.p
              className="text-xl text-zinc-400 mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Learn how to use Grovekeeper&apos;s features to streamline your guild management
            </motion.p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-32">
        <div className="flex gap-12">
          {/* Navigation Sidebar */}
          <div className="w-64 shrink-0">
            <div className="sticky top-32 space-y-8">
              {DOCS_SECTIONS.map(section => (
                <div key={section.id} className="space-y-3">
                  <a 
                    href={`#${section.id}`} 
                    className="text-lg font-semibold hover:text-[#00E6B4] transition-colors"
                  >
                    {section.title}
                  </a>
                  <ul className="space-y-2 pl-4">
                    {section.subsections.map(subsection => (
                      <li key={subsection.id}>
                        <a 
                          href={`#${subsection.id}`}
                          className="text-sm text-zinc-400 hover:text-white transition-colors"
                        >
                          {subsection.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 max-w-4xl pb-24 space-y-32">
            {/* Regear Calculator Section */}
            <section id="regear-calculator" className="space-y-12">
              <div className="space-y-4">
                <h2 className="text-4xl font-bold">Regear Calculator</h2>
                <p className="text-lg text-zinc-400">
                  The Regear Calculator is a powerful tool designed to help guild officers and leaders quickly calculate the cost of regearing players after deaths in Albion Online. It supports both individual and group calculations, with customizable options for different regear policies.
                </p>
              </div>

              {/* Core Features */}
              <div id="tracking-features" className="space-y-6">
                <h3 className="text-2xl font-semibold">Core Features</h3>
                <ul className="list-disc list-inside space-y-3 text-zinc-400 text-lg">
                  <li>Individual and group death analysis</li>
                  <li>Automatic price calculations based on market data</li>
                  <li>Custom calculation mode for selective regearing</li>
                  <li>Price display in different currencies (Silver, Tomes, Toys, Siphoned Energy)</li>
                  <li>Price reliability indicators</li>
                  <li>Historical price tracking</li>
                </ul>
              </div>

              {/* How It Works */}
              <div id="how-it-works" className="space-y-8">
                <h3 className="text-2xl font-semibold">How It Works</h3>
                
                {/* Input Section */}
                <div className="space-y-6">
                  <h4 className="text-xl font-medium">1. Input</h4>
                  <p className="text-lg text-zinc-400 mb-6">
                    Start by entering a killboard URL or multiple URLs for group calculations. The calculator accepts both individual killboard links and batches of URLs for mass processing.
                  </p>
                  
                  <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-zinc-800 p-8 space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button 
                              type="button"
                              className="flex h-10 items-center justify-between gap-2 rounded-md bg-transparent py-2 text-sm font-medium shadow-sm hover:bg-zinc-800/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-700 disabled:pointer-events-none disabled:opacity-50 min-w-[140px]"
                            >
                              <div className="flex items-center gap-2">
                                <Users2 className="w-4 h-4" />
                                <span>Individual</span>
                              </div>
                              <ChevronDown className="w-4 h-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-[140px]">
                            <DropdownMenuItem>Individual</DropdownMenuItem>
                            <DropdownMenuItem>Group</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <div className="flex-1 flex items-center gap-2">
                          <Input
                            placeholder="https://albiononline.com/killboard/kill/..."
                            className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0 h-10"
                          />
                        </div>
                      </div>
                    </div>
                    <Button className="w-full bg-[#00E6B4] text-black hover:bg-[#1BECA0] h-10 text-base">
                      Calculate Regear
                    </Button>
                  </div>
                </div>

                {/* Processing Section */}
                <div className="space-y-6">
                  <h4 className="text-xl font-medium">2. Processing</h4>
                  <p className="text-lg text-zinc-400">
                    The calculator processes the killboard data through several steps:
                  </p>
                  <ul className="list-disc list-inside space-y-3 text-lg text-zinc-400 ml-4">
                    <li>Fetches death details from the Albion Online API</li>
                    <li>Retrieves current market prices for all lost items</li>
                    <li>Analyzes price history for reliability assessment</li>
                    <li>Calculates total regear cost based on configured settings</li>
                  </ul>
                </div>

                {/* Results Section */}
                <div className="space-y-6">
                  <h4 className="text-xl font-medium">3. Results</h4>
                  <p className="text-lg text-zinc-400 mb-6">
                    Results are displayed in an organized layout showing equipped items and inventory separately, with detailed price information and quality indicators.
                  </p>
                  
                  <div className="border border-zinc-800 rounded-lg overflow-hidden">
                    <RegearResultComponent 
                      result={MOCK_REGEAR_RESULT}
                      compact={true}
                    />
                  </div>
                </div>
              </div>

              {/* Advanced Features */}
              <div id="advanced-features" className="space-y-8">
                <h3 className="text-2xl font-semibold">Advanced Features</h3>
                
                {/* Custom Mode */}
                <div className="space-y-6">
                  <h4 className="text-xl font-medium">Custom Mode</h4>
                  <p className="text-lg text-zinc-400 mb-6">
                    Custom mode allows officers to selectively choose which items to include in the regear calculation. This is useful for implementing specific regear policies or excluding certain items.
                  </p>
                  <div className="flex items-center gap-4 bg-white/5 backdrop-blur-sm rounded-lg border border-zinc-800 p-6">
                    <Switch id="custom-mode-demo" className="h-6 w-11" />
                    <Label htmlFor="custom-mode-demo" className="text-lg">Custom Mode</Label>
                  </div>
                </div>

                {/* Price Display Options */}
                <div className="space-y-6">
                  <h4 className="text-xl font-medium">Price Display Options</h4>
                  <p className="text-lg text-zinc-400 mb-6">
                    Toggle between different currencies to display regear costs in the most relevant format for your guild:
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-zinc-800 p-6 text-center">
                      <p className="text-lg text-zinc-400">Silver</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-zinc-800 p-6 text-center">
                      <p className="text-lg text-zinc-400">Tomes of Insight</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-zinc-800 p-6 text-center">
                      <p className="text-lg text-zinc-400">Toys</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-zinc-800 p-6 text-center">
                      <p className="text-lg text-zinc-400">Siphoned Energy</p>
                    </div>
                  </div>
                </div>

                {/* Price Value Indicators */}
                <div className="space-y-6">
                  <h4 className="text-xl font-medium">Price Value Indicators</h4>
                  <p className="text-lg text-zinc-400 mb-6">
                    Each item displays a colored indicator showing its value range:
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                    <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-zinc-800 p-6 text-center">
                      <div className="w-full h-2 bg-zinc-800 rounded mb-3" />
                      <p className="text-lg text-zinc-400">No Price Data</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-zinc-800 p-6 text-center">
                      <div className="w-full h-2 bg-gray-400 rounded mb-3" />
                      <p className="text-lg text-zinc-400">Basic Items</p>
                      <p className="text-sm text-zinc-500">&lt;100k Silver</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-zinc-800 p-6 text-center">
                      <div className="w-full h-2 bg-blue-400 rounded mb-3" />
                      <p className="text-lg text-zinc-400">Valuable</p>
                      <p className="text-sm text-zinc-500">&lt;500k Silver</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-zinc-800 p-6 text-center">
                      <div className="w-full h-2 bg-green-400 rounded mb-3" />
                      <p className="text-lg text-zinc-400">Expensive</p>
                      <p className="text-sm text-zinc-500">&lt;1M Silver</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-zinc-800 p-6 text-center">
                      <div className="w-full h-2 bg-amber-400 rounded mb-3" />
                      <p className="text-lg text-zinc-400">Premium</p>
                      <p className="text-sm text-zinc-500">&gt;5M Silver</p>
                    </div>
                  </div>
                </div>

                {/* Price History */}
                <div className="space-y-6">
                  <h4 className="text-xl font-medium">Price History</h4>
                  <p className="text-lg text-zinc-400 mb-6">
                    Each item displays a question mark icon (?) that reveals a detailed price history chart on hover, helping you track market trends.
                  </p>
                  <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-zinc-800 p-8">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-zinc-800/50 rounded-lg flex items-center justify-center">
                          <Image 
                            src="https://render.albiononline.com/v1/item/T8_HEAD_CLOTH_SET3.png"
                            alt="Scholar Cowl"
                            width={40}
                            height={40}
                            className="w-10 h-10"
                          />
                        </div>
                        <div>
                          <h5 className="font-medium">Scholar Cowl</h5>
                          <p className="text-sm text-zinc-400">Normal Quality</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">450,000</span>
                        <div className="relative group">
                          <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center cursor-help">
                            <span className="text-sm">?</span>
                          </div>
                          {/* Tooltip with graph */}
                          <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                            <div className="bg-[#1C2128] rounded-lg border border-zinc-800 p-4 shadow-xl w-[300px]">
                              <div className="mb-2">
                                <h6 className="text-sm font-medium">Price History</h6>
                                <p className="text-xs text-zinc-400">Last 7 days</p>
                              </div>
                              <div className="bg-[#0D1117] rounded-md p-4">
                                <div className="h-[120px] flex items-end gap-1">
                                  <div className="flex-1 bg-[#00E6B4]/20 hover:bg-[#00E6B4]/30 transition-colors rounded-sm h-[30%]" />
                                  <div className="flex-1 bg-[#00E6B4]/20 hover:bg-[#00E6B4]/30 transition-colors rounded-sm h-[45%]" />
                                  <div className="flex-1 bg-[#00E6B4]/20 hover:bg-[#00E6B4]/30 transition-colors rounded-sm h-[60%]" />
                                  <div className="flex-1 bg-[#00E6B4]/20 hover:bg-[#00E6B4]/30 transition-colors rounded-sm h-[40%]" />
                                  <div className="flex-1 bg-[#00E6B4]/20 hover:bg-[#00E6B4]/30 transition-colors rounded-sm h-[80%]" />
                                  <div className="flex-1 bg-[#00E6B4]/20 hover:bg-[#00E6B4]/30 transition-colors rounded-sm h-[100%]" />
                                  <div className="flex-1 bg-[#00E6B4]/20 hover:bg-[#00E6B4]/30 transition-colors rounded-sm h-[75%]" />
                                </div>
                              </div>
                              <div className="mt-4 pt-4 border-t border-zinc-800">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <p className="text-zinc-400">Average Price</p>
                                    <p className="font-medium">425,000</p>
                                  </div>
                                  <div>
                                    <p className="text-zinc-400">Price Variation</p>
                                    <p className="font-medium text-amber-400">+15%</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-zinc-400">
                      The price history chart shows:
                    </p>
                    <ul className="list-disc list-inside space-y-2 mt-4 text-zinc-400">
                      <li>Daily price changes over the last 7 days</li>
                      <li>Average price for the period</li>
                      <li>Price variation percentage</li>
                      <li>Interactive chart with price details on hover</li>
                    </ul>
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-6">
                    <p className="text-amber-200/80 text-lg">
                      Use the price history to identify market trends and ensure fair compensation based on recent price data.
                    </p>
                  </div>
                </div>

                {/* Group Filters */}
                <div id="group-filters" className="space-y-8">
                  <h3 className="text-2xl font-semibold">Group Filters</h3>
                  <p className="text-lg text-zinc-400">
                    When processing multiple deaths at once, you can apply filters to ensure the regear calculations match your guild&apos;s policies. These filters help maintain consistency and prevent abuse.
                  </p>
                  
                  <div className="space-y-8">
                    {/* IP Filter */}
                    <div className="space-y-6">
                      <h4 className="text-xl font-medium">IP Requirements</h4>
                      <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-zinc-800 p-8 space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Switch id="ip-filter-demo" className="h-6 w-11" />
                              <Label htmlFor="ip-filter-demo" className="text-lg">Enable Minimum IP</Label>
                            </div>
                            <p className="text-sm text-zinc-400">Only process deaths where the player met the minimum IP requirement</p>
                          </div>
                          <div className="w-24">
                            <Input
                              type="number"
                              placeholder="1400"
                              className="text-center"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Equipment Slots */}
                    <div className="space-y-6">
                      <h4 className="text-xl font-medium">Equipment Slots</h4>
                      <p className="text-lg text-zinc-400">
                        Choose which equipment slots to include in the regear calculation:
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-zinc-800 p-6">
                          <div className="flex items-center gap-3">
                            <Switch id="weapon-slot" className="h-6 w-11" />
                            <Label htmlFor="weapon-slot" className="text-lg">Weapon</Label>
                          </div>
                        </div>
                        <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-zinc-800 p-6">
                          <div className="flex items-center gap-3">
                            <Switch id="armor-slot" className="h-6 w-11" />
                            <Label htmlFor="armor-slot" className="text-lg">Armor</Label>
                          </div>
                        </div>
                        <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-zinc-800 p-6">
                          <div className="flex items-center gap-3">
                            <Switch id="head-slot" className="h-6 w-11" />
                            <Label htmlFor="head-slot" className="text-lg">Head</Label>
                          </div>
                        </div>
                        <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-zinc-800 p-6">
                          <div className="flex items-center gap-3">
                            <Switch id="shoes-slot" className="h-6 w-11" />
                            <Label htmlFor="shoes-slot" className="text-lg">Shoes</Label>
                          </div>
                        </div>
                        <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-zinc-800 p-6">
                          <div className="flex items-center gap-3">
                            <Switch id="cape-slot" className="h-6 w-11" />
                            <Label htmlFor="cape-slot" className="text-lg">Cape</Label>
                          </div>
                        </div>
                        <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-zinc-800 p-6">
                          <div className="flex items-center gap-3">
                            <Switch id="mount-slot" className="h-6 w-11" />
                            <Label htmlFor="mount-slot" className="text-lg">Mount</Label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Additional Options */}
                    <div className="space-y-6">
                      <h4 className="text-xl font-medium">Additional Options</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-zinc-800 p-6">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <Switch id="deny-bag" className="h-6 w-11" />
                              <Label htmlFor="deny-bag" className="text-lg">Deny Bag Items</Label>
                            </div>
                            <p className="text-sm text-zinc-400">Exclude all items that were in the inventory</p>
                          </div>
                        </div>
                        <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-zinc-800 p-6">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <Switch id="deny-mount" className="h-6 w-11" />
                              <Label htmlFor="deny-mount" className="text-lg">Deny Carrying Mount</Label>
                            </div>
                            <p className="text-sm text-zinc-400">Exclude mounts used for carrying (e.g., Ox, Transport Mammoth)</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pro Tips */}
              <div id="pro-tips" className="space-y-6">
                <h3 className="text-2xl font-semibold">Pro Tips</h3>
                <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-zinc-800 p-8 space-y-6">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-amber-400" />
                    <h4 className="text-xl font-medium">Group Processing</h4>
                  </div>
                  <p className="text-lg text-zinc-400">
                    Create a regear channel in your guild&apos;s Discord. When players die, ask them to post their death URL along with the screenshot. You can then simply copy everything - screenshots, usernames, links, etc. - and paste it here. The calculator will automatically extract and process just the death links.
                  </p>
                </div>
              </div>
            </section>

            {/* Attendance section */}
            <section id="attendance" className="space-y-12">
              <div className="space-y-4">
                <h2 className="text-4xl font-bold">Attendance Tracker</h2>
                <p className="text-lg text-zinc-400">
                  The Attendance Tracker helps guild leaders monitor and analyze member participation in ZvZ and small-scale battles. It provides detailed insights into player performance, roles, and attendance patterns.
                </p>
              </div>

              {/* Tier System */}
              <div id="tier-system" className="space-y-6">
                <h3 className="text-2xl font-semibold">Tier System</h3>
                <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-zinc-800 p-8 space-y-6">
                  <div className="space-y-4">
                    <p className="text-lg text-zinc-400">
                      Players are assigned tiers (S, A, B, C) based on a comprehensive scoring system that considers multiple factors weighted differently for each role.
                    </p>

                    <div className="space-y-6">
                      {/* Scoring Factors */}
                      <div>
                        <h4 className="text-xl font-medium mb-3">Scoring Factors</h4>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="bg-white/5 p-4 rounded">
                            <h5 className="font-medium mb-2">Attendance Score (0-100)</h5>
                            <p className="text-sm text-zinc-400">Based on participation relative to global average attendance. Scores above average are capped at 100.</p>
                          </div>
                          <div className="bg-white/5 p-4 rounded">
                            <h5 className="font-medium mb-2">Performance Score (0-100)</h5>
                            <p className="text-sm text-zinc-400">Calculated relative to similar and best guilds, considering damage/healing based on role.</p>
                          </div>
                          <div className="bg-white/5 p-4 rounded">
                            <h5 className="font-medium mb-2">KDA Score (0-100)</h5>
                            <p className="text-sm text-zinc-400">Kill/Death ratio normalized to 100. A 2.0 KD ratio equals 100 points.</p>
                          </div>
                          <div className="bg-white/5 p-4 rounded">
                            <h5 className="font-medium mb-2">IP Score (0-100)</h5>
                            <p className="text-sm text-zinc-400">Based on average IP relative to role baseline (1300 for Tanks, 1200 for others).</p>
                          </div>
                        </div>
                      </div>

                      {/* Role Weights */}
                      <div>
                        <h4 className="text-xl font-medium mb-3">Role-Specific Weights</h4>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-zinc-800">
                                <th className="text-left py-2">Role</th>
                                <th className="text-center py-2">Attendance</th>
                                <th className="text-center py-2">Performance</th>
                                <th className="text-center py-2">KDA</th>
                                <th className="text-center py-2">IP</th>
                              </tr>
                            </thead>
                            <tbody className="text-zinc-400">
                              <tr className="border-b border-zinc-800/50">
                                <td className="py-2">DPS</td>
                                <td className="text-center">40%</td>
                                <td className="text-center">30%</td>
                                <td className="text-center">15%</td>
                                <td className="text-center">15%</td>
                              </tr>
                              <tr className="border-b border-zinc-800/50">
                                <td className="py-2">Tank</td>
                                <td className="text-center">45%</td>
                                <td className="text-center">30%</td>
                                <td className="text-center">5%</td>
                                <td className="text-center">20%</td>
                              </tr>
                              <tr className="border-b border-zinc-800/50">
                                <td className="py-2">Healer</td>
                                <td className="text-center">45%</td>
                                <td className="text-center">35%</td>
                                <td className="text-center">5%</td>
                                <td className="text-center">15%</td>
                              </tr>
                              <tr className="border-b border-zinc-800/50">
                                <td className="py-2">Support</td>
                                <td className="text-center">40%</td>
                                <td className="text-center">35%</td>
                                <td className="text-center">10%</td>
                                <td className="text-center">15%</td>
                              </tr>
                              <tr>
                                <td className="py-2">Utility</td>
                                <td className="text-center">35%</td>
                                <td className="text-center">30%</td>
                                <td className="text-center">20%</td>
                                <td className="text-center">15%</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Tier Thresholds */}
                      <div>
                        <h4 className="text-xl font-medium mb-3">Tier Thresholds</h4>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                          <div className="bg-white/5 p-4 rounded">
                            <h5 className="font-medium text-amber-400 mb-2">S Tier (85+ points)</h5>
                            <p className="text-sm text-zinc-400">Exceptional performance across all metrics</p>
                          </div>
                          <div className="bg-white/5 p-4 rounded">
                            <h5 className="font-medium text-zinc-200 mb-2">A Tier (70-84 points)</h5>
                            <p className="text-sm text-zinc-400">Above average performance</p>
                          </div>
                          <div className="bg-white/5 p-4 rounded">
                            <h5 className="font-medium text-zinc-400 mb-2">B Tier (50-69 points)</h5>
                            <p className="text-sm text-zinc-400">Average performance</p>
                          </div>
                          <div className="bg-white/5 p-4 rounded">
                            <h5 className="font-medium text-zinc-600 mb-2">C Tier (Below 50)</h5>
                            <p className="text-sm text-zinc-400">Below average performance</p>
                          </div>
                        </div>
                      </div>

                      {/* Additional Notes */}
                      <div className="bg-white/5 p-4 rounded">
                        <h4 className="text-xl font-medium mb-3">Additional Notes</h4>
                        <ul className="list-disc list-inside space-y-2 text-zinc-400">
                          <li>Performance is compared to similar guilds (±20% size) and the best performing guilds</li>
                          <li>If no similar guild data exists, performance is compared to 80% of your guild&apos;s average</li>
                          <li>If no best guild data exists, performance target is set to 120% of your guild&apos;s average</li>
                          <li>Rankings are sorted by attendance first, then by performance score</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tracking Features */}
              <div id="tracking" className="space-y-6">
                <h3 className="text-2xl font-semibold">Tracking Features</h3>
                <ul className="list-disc list-inside space-y-3 text-zinc-400 text-lg">
                  <li>Battle type filtering (ZvZ or All battles)</li>
                  <li>Custom member list support</li>
                  <li>Role-based performance analysis</li>
                  <li>Comparative statistics with similar guilds</li>
                  <li>Historical data tracking</li>
                  <li>Performance tier classification</li>
                </ul>
              </div>

              {/* How It Works */}
              <div className="space-y-8">
                <h3 className="text-2xl font-semibold">How It Works</h3>
                
                {/* Input Section */}
                <div className="space-y-6">
                  <h4 className="text-xl font-medium">1. Guild Selection</h4>
                  <p className="text-lg text-zinc-400 mb-6">
                    Start by selecting your battle type preference and entering your guild name. The system will automatically fetch your guild&apos;s information and member list.
                  </p>
                  
                  <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-zinc-800 p-8 space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <Select>
                          <SelectTrigger className="w-[180px] border-0 bg-transparent">
                            <SelectValue placeholder="Only ZvZ" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="zvz">Only ZvZ</SelectItem>
                            <SelectItem value="all">ZvZ and Small</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex items-center gap-2 flex-1">
                          <SearchIcon className="w-5 h-5 text-zinc-400" />
                          <Input
                            placeholder="Enter guild name"
                            className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Switch />
                          <Label className="text-sm text-zinc-400">Use custom member list</Label>
                        </div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <HelpCircle className="h-4 w-4 text-zinc-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>The list of player names can be found in the copy and paste function at the guild management option inside the game.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Analysis Section */}
                <div className="space-y-6">
                  <h4 className="text-xl font-medium">2. Performance Analysis</h4>
                  <p className="text-lg text-zinc-400">
                    The system analyzes various aspects of player performance:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-zinc-800 p-6">
                      <h5 className="text-lg font-medium mb-4">Role Detection</h5>
                      <ul className="space-y-2 text-zinc-400">
                        <li>• DPS (Damage Dealers)</li>
                        <li>• Tank (Frontline)</li>
                        <li>• Healer (Support)</li>
                        <li>• Support (Utility)</li>
                        <li>• Utility (Flexible)</li>
                      </ul>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-zinc-800 p-6">
                      <h5 className="text-lg font-medium mb-4">Performance Metrics</h5>
                      <ul className="space-y-2 text-zinc-400">
                        <li>• Kill/Death Ratio</li>
                        <li>• Average Item Power</li>
                        <li>• Damage Output</li>
                        <li>• Healing Done</li>
                        <li>• Battle Attendance</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Results Section */}
                <div className="space-y-6">
                  <h4 className="text-xl font-medium">3. Results & Rankings</h4>
                  <p className="text-lg text-zinc-400 mb-6">
                    Players are ranked and classified into performance tiers based on their contributions and attendance:
                  </p>
                  <div className="rounded-lg border border-zinc-800/50 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-[#161B22]">
                          <tr>
                            <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400 w-16">#</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400 w-12">Class</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Player</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400 w-16">Tier</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">K/D</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Avg IP</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Attendance</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Performance</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Most Used</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="bg-[#0D1117] hover:bg-[#1C2128] transition-colors">
                            <td className="py-3 px-4 font-medium text-zinc-400">1</td>
                            <td className="py-3 px-4">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Shield className="w-5 h-5 text-[#00E6B4]" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Tank</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </td>
                            <td className="py-3 px-4 font-medium">DarkWarrior</td>
                            <td className="py-3 px-4">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <div className="flex items-center justify-center w-6 h-6 rounded border bg-amber-500/20 text-amber-500 border-amber-500/50">
                                      S
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>15% more attendance than average</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </td>
                            <td className="py-3 px-4">
                              <HoverCard>
                                <HoverCardTrigger asChild>
                                  <div className="flex gap-1 cursor-help">
                                    <span className="text-green-500">15</span>
                                    <span>/</span>
                                    <span className="text-red-500">3</span>
                                  </div>
                                </HoverCardTrigger>
                                <HoverCardContent side="right" className="w-[350px] p-4">
                                  <div className="space-y-2">
                                    <h3 className="font-semibold">K/D Comparison (Tank)</h3>
                                    <p className="text-sm text-zinc-400">Your K/D: 5.0</p>
                                    <p className="text-sm text-zinc-400">
                                      <span className="text-green-400">+25%</span> compared to similar guild
                                    </p>
                                  </div>
                                </HoverCardContent>
                              </HoverCard>
                            </td>
                            <td className="py-3 px-4">
                              <HoverCard>
                                <HoverCardTrigger asChild>
                                  <div className="cursor-help">1425</div>
                                </HoverCardTrigger>
                                <HoverCardContent side="right" className="w-[350px] p-4">
                                  <div className="space-y-2">
                                    <h3 className="font-semibold">Average IP Comparison (Tank)</h3>
                                    <p className="text-sm text-zinc-400">Your IP: 1425</p>
                                    <p className="text-sm text-zinc-400">
                                      <span className="text-green-400">+10%</span> compared to similar guild
                                    </p>
                                  </div>
                                </HoverCardContent>
                              </HoverCard>
                            </td>
                            <td className="py-3 px-4">25</td>
                            <td className="py-3 px-4">
                              <HoverCard>
                                <HoverCardTrigger asChild>
                                  <div className="flex items-center gap-2 text-[#00E6B4] cursor-help">
                                    <Swords className="w-4 h-4" />
                                    <span>125K</span>
                                  </div>
                                </HoverCardTrigger>
                                <HoverCardContent side="right" className="w-[350px] p-4">
                                  <div className="space-y-2">
                                    <h3 className="font-semibold">Damage Comparison (Tank)</h3>
                                    <p className="text-sm text-zinc-400">Your Damage: 125,000</p>
                                    <p className="text-sm text-zinc-400">
                                      <span className="text-green-400">+15%</span> compared to similar guild
                                    </p>
                                  </div>
                                </HoverCardContent>
                              </HoverCard>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1">
                                <div className="w-12 h-12 rounded bg-[#1C2128] border border-zinc-800/50 p-1">
                                  <Image
                                    src="https://render.albiononline.com/v1/item/T8_MAIN_MACE.png"
                                    alt="Weapon"
                                    width={40}
                                    height={40}
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                                <div className="w-12 h-12 rounded bg-[#1C2128] border border-zinc-800/50 p-1">
                                  <Image
                                    src="https://render.albiononline.com/v1/item/T8_2H_POLEHAMMER.png"
                                    alt="Weapon"
                                    width={40}
                                    height={40}
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                              </div>
                            </td>
                          </tr>
                          {/* Add more example rows here */}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Reports */}
              <div id="reports" className="space-y-6">
                <h3 className="text-2xl font-semibold">Performance Reports</h3>
                
                {/* Guild Comparison */}
                <div className="space-y-6">
                  <h4 className="text-xl font-medium">Guild Comparisons</h4>
                  <p className="text-lg text-zinc-400 mb-6">
                    Compare your guild&apos;s performance with similar-sized guilds and top performers:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-zinc-800 p-6">
                      <h5 className="text-lg font-medium mb-4">Role Distribution</h5>
                      <ul className="space-y-2 text-zinc-400">
                        <li>• Class balance analysis</li>
                        <li>• Role coverage</li>
                        <li>• Composition suggestions</li>
                      </ul>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-zinc-800 p-6">
                      <h5 className="text-lg font-medium mb-4">Performance Metrics</h5>
                      <ul className="space-y-2 text-zinc-400">
                        <li>• Average IP comparison</li>
                        <li>• Kill/Death efficiency</li>
                        <li>• Battle impact scores</li>
                      </ul>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-zinc-800 p-6">
                      <h5 className="text-lg font-medium mb-4">Historical Trends</h5>
                      <ul className="space-y-2 text-zinc-400">
                        <li>• Monthly statistics</li>
                        <li>• Progress tracking</li>
                        <li>• Improvement areas</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile section */}
              <section id="profile" className="space-y-12">
                <div className="space-y-4">
                  <h2 className="text-4xl font-bold">Player Profile</h2>
                  <p className="text-lg text-zinc-400">
                    The Player Profile system provides comprehensive insights into a player&apos;s performance, activities, and progression in Albion Online. It offers detailed statistics, battle history, and performance analytics.
                  </p>
                </div>

                {/* Core Features */}
                <div id="profile-features" className="space-y-6">
                  <h3 className="text-2xl font-semibold">Core Features</h3>
                  <ul className="list-disc list-inside space-y-3 text-zinc-400 text-lg">
                    <li>Real-time player statistics and performance tracking</li>
                    <li>Detailed ZvZ performance analytics</li>
                    <li>Guild history and progression</li>
                    <li>Recent activities monitoring</li>
                    <li>Fame distribution analysis</li>
                    <li>Battle performance metrics</li>
                  </ul>
                </div>

                {/* How It Works */}
                <div className="space-y-8">
                  <h3 className="text-2xl font-semibold">How It Works</h3>
                  
                  {/* Search Section */}
                  <div className="space-y-6">
                    <h4 className="text-xl font-medium">1. Player Search</h4>
                    <p className="text-lg text-zinc-400 mb-6">
                      Start by entering a player&apos;s name to view their profile. The system will automatically fetch their latest information and activities.
                    </p>
                    
                    <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-zinc-800 p-8 space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <SearchIcon className="w-5 h-5 text-zinc-400" />
                          <div className="flex-1 flex items-center gap-2">
                            <Select>
                              <SelectTrigger className="w-[140px] bg-transparent border-0">
                                <SelectValue placeholder="West" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="west">West</SelectItem>
                              </SelectContent>
                            </Select>
                            <div className="w-px h-6 bg-zinc-800" />
                            <Input
                              placeholder="Enter player name"
                              className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Profile Overview */}
                  <div className="space-y-6">
                    <h4 className="text-xl font-medium">2. Profile Overview</h4>
                    <p className="text-lg text-zinc-400">
                      The profile displays comprehensive information about the player:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-zinc-800 p-6">
                        <h5 className="text-lg font-medium mb-4">Basic Information</h5>
                        <ul className="space-y-2 text-zinc-400">
                          <li>• Player name and avatar</li>
                          <li>• Current guild and alliance</li>
                          <li>• Total PvP fame</li>
                          <li>• Total PvE fame</li>
                          <li>• Gathering and crafting fame</li>
                        </ul>
                      </div>
                      <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-zinc-800 p-6">
                        <h5 className="text-lg font-medium mb-4">Performance Metrics</h5>
                        <ul className="space-y-2 text-zinc-400">
                          <li>• Kill/Death ratio</li>
                          <li>• Average damage output</li>
                          <li>• Average healing done</li>
                          <li>• Battle participation</li>
                          <li>• Total kill fame</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* ZvZ Performance */}
                  <div className="space-y-6">
                    <h4 className="text-xl font-medium">3. ZvZ Performance</h4>
                    <p className="text-lg text-zinc-400 mb-6">
                      Track detailed ZvZ performance with interactive charts and statistics:
                    </p>
                    <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-zinc-800 p-8">
                      <div className="grid grid-cols-4 gap-4 mb-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold">25</div>
                          <div className="text-sm text-zinc-400">Total Battles</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-500">15</div>
                          <div className="text-sm text-zinc-400">Kills</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-500">28</div>
                          <div className="text-sm text-zinc-400">Assists</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-500">3</div>
                          <div className="text-sm text-zinc-400">Deaths</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-zinc-400">K/A/D Ratio</span>
                          <span className="font-medium">14.3</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-zinc-400">Avg Damage</span>
                          <span className="font-medium">125K</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-zinc-400">Avg Healing</span>
                          <span className="font-medium">45K</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-zinc-400">Total Kill Fame</span>
                          <span className="font-medium text-[#00E6B4]">15.2M</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activities */}
                  <div className="space-y-6">
                    <h4 className="text-xl font-medium">4. Recent Activities</h4>
                    <p className="text-lg text-zinc-400 mb-6">
                      The Recent Activities section shows a chronological list of player battles with detailed information about each engagement:
                    </p>
                    <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-zinc-800 p-8">
                      <div className="space-y-6">
                        <h5 className="text-lg font-medium">Activity Card Colors</h5>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-[#0D1117] border-green-500/20 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Swords className="w-4 h-4 text-green-500" />
                              <span className="text-sm">Kill</span>
                            </div>
                            <p className="text-xs text-zinc-400">When you are the killer</p>
                          </div>
                          <div className="bg-[#0D1117] border-blue-500/20 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <HandHelping className="w-4 h-4 text-blue-500" />
                              <span className="text-sm">Assist</span>
                            </div>
                            <p className="text-xs text-zinc-400">When you assisted in the kill</p>
                          </div>
                          <div className="bg-[#0D1117] border-red-500/20 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Skull className="w-4 h-4 text-red-500" />
                              <span className="text-sm">Death</span>
                            </div>
                            <p className="text-xs text-zinc-400">When you are the victim</p>
                          </div>
                        </div>

                        <h5 className="text-lg font-medium mt-8">Card Information</h5>
                        <div className="space-y-4">
                          <div className="bg-[#0D1117] rounded-lg p-4">
                            <h6 className="font-medium mb-2">Top Row</h6>
                            <div className="flex items-center justify-between text-sm text-zinc-400">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4" />
                                  <span>Time ago</span>
                                </div>
                                <span className="text-green-500">(Fair Fight)</span>
                                <span className="text-yellow-500">(Unfair Fight)</span>
                                <span>Battle Type (1v1, 2v2, 5v5, ZvZ)</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Users2 className="w-4 h-4" />
                                <span>Total Players</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-[#0D1117] rounded-lg p-4">
                            <h6 className="font-medium mb-2">Combat Stats</h6>
                            <div className="flex items-center gap-6 text-sm text-zinc-400">
                              <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-blue-400" />
                                <span>Damage Done</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-green-400" />
                                <span>Healing Done</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <ExternalLink className="w-4 h-4" />
                                <span>Link to Killboard</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-6 mt-6">
                          <p className="text-amber-200/80">
                            The activities list shows data from the last 30 days by default. Click &quot;Load More&quot; at the bottom to fetch older data.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Profile Info Widget */}
                  <div className="space-y-6">
                    <h4 className="text-xl font-medium">5. Profile Info Widget</h4>
                    <p className="text-lg text-zinc-400 mb-6">
                      The Profile Info widget displays comprehensive player statistics and data period information:
                    </p>
                    <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-zinc-800 p-8">
                      <div className="space-y-6">
                        <h5 className="text-lg font-medium">Data Period</h5>
                        <div className="bg-[#0D1117] rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Info className="w-4 h-4 text-[#00E6B4]" />
                            <span className="text-sm">Data Range Indicator</span>
                          </div>
                          <p className="text-xs text-zinc-400">Shows the time range of the displayed data (e.g., &ldquo;Last 30 days&rdquo;)</p>
                        </div>

                        <h5 className="text-lg font-medium">Fame Distribution</h5>
                        <div className="space-y-4">
                          <div className="bg-[#0D1117] rounded-lg p-4">
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm">PvP Fame</span>
                                <div className="w-48 h-2 bg-green-500/20 rounded" />
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm">PvE Fame</span>
                                <div className="w-48 h-2 bg-blue-500/20 rounded" />
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Gathering Fame</span>
                                <div className="w-48 h-2 bg-yellow-500/20 rounded" />
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Crafting Fame</span>
                                <div className="w-48 h-2 bg-purple-500/20 rounded" />
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-zinc-400">
                            Progress bars show the distribution of fame across different activities
                          </p>
                        </div>

                        <div className="bg-[#00E6B4]/10 border border-[#00E6B4]/20 rounded-lg p-6 mt-6">
                          <p className="text-[#00E6B4]/80">
                            We maintain our own database of player statistics, allowing for faster access and historical tracking. Use the &quot;Load More&quot; button to access older data beyond the default 30-day period.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Guild History */}
                  <div className="space-y-6">
                    <h4 className="text-xl font-medium">6. Guild History & Deep Search</h4>
                    <p className="text-lg text-zinc-400 mb-6">
                      The Guild History feature provides comprehensive tracking of a player&apos;s guild affiliations and allows deep searching through historical data:
                    </p>
                    <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-zinc-800 p-8">
                      <div className="space-y-6">
                        <h5 className="text-lg font-medium">Timeline View</h5>
                        <div className="bg-[#0D1117] rounded-lg p-4">
                          <div className="space-y-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-lg bg-zinc-800/50 flex items-center justify-center">
                                <Users2 className="w-6 h-6 text-[#00E6B4]" />
                              </div>
                              <div>
                                <h6 className="font-medium">Chronological History</h6>
                                <p className="text-sm text-zinc-400">View all guild changes with exact dates and durations</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <h5 className="text-lg font-medium">Deep Search Features</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-[#0D1117] rounded-lg p-4">
                            <h6 className="font-medium mb-2">Historical Data</h6>
                            <ul className="space-y-2 text-sm text-zinc-400">
                              <li>• Guild membership periods</li>
                              <li>• Alliance affiliations</li>
                              <li>• Leadership positions</li>
                              <li>• Activity during each period</li>
                            </ul>
                          </div>
                          <div className="bg-[#0D1117] rounded-lg p-4">
                            <h6 className="font-medium mb-2">Performance Analysis</h6>
                            <ul className="space-y-2 text-sm text-zinc-400">
                              <li>• Kill Fame per guild</li>
                              <li>• ZvZ participation rates</li>
                              <li>• Role consistency</li>
                              <li>• Contribution metrics</li>
                            </ul>
                          </div>
                        </div>

                        <div className="bg-[#0D1117] rounded-lg p-4">
                          <h6 className="font-medium mb-2">Search Capabilities</h6>
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <SearchIcon className="w-4 h-4 text-[#00E6B4]" />
                              <span className="text-sm">Search by guild name or alliance</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-[#00E6B4]" />
                              <span className="text-sm">Filter by time period</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Shield className="w-4 h-4 text-[#00E6B4]" />
                              <span className="text-sm">Filter by role or position</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-[#00E6B4]/10 border border-[#00E6B4]/20 rounded-lg p-6 mt-6">
                          <p className="text-[#00E6B4]/80">
                            Our deep search functionality maintains a complete history of guild affiliations, allowing you to track a player&apos;s progression and loyalty throughout their Albion Online career.
                          </p>
                        </div>

                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-6">
                          <div className="flex items-center gap-2 mb-2">
                            <Info className="w-4 h-4 text-amber-200" />
                            <span className="text-amber-200 font-medium">Pro Tip</span>
                          </div>
                          <p className="text-amber-200/80">
                            Use the deep search feature during recruitment to understand a player&apos;s guild loyalty and performance history. Look for patterns in their guild changes and performance metrics to make informed decisions.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
} 