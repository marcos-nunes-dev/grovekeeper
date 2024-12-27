'use client'

import { motion } from 'framer-motion'
import { ChevronDown, Users2, Sparkles } from 'lucide-react'
import RegearResult from '@/components/regear-result'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Mock data for examples
const MOCK_REGEAR_RESULT = {
  equipped: [
    {
      id: 'T8_HEAD_CLOTH_SET3',
      name: 'Scholar Cowl',
      value: 450000,
      formattedValue: '450,000',
      quality: 1,
      count: 1,
      isReliablePrice: true
    },
    {
      id: 'T8_ARMOR_CLOTH_SET3',
      name: 'Scholar Robe',
      value: 550000,
      formattedValue: '550,000',
      quality: 1,
      count: 1,
      isReliablePrice: true
    }
  ],
  bag: [
    {
      id: 'T4_POTION_HEAL',
      name: 'Minor Healing Potion',
      value: 1000,
      formattedValue: '1,000',
      quality: 1,
      count: 3,
      isReliablePrice: true
    }
  ],
  total: {
    value: 1003000,
    formatted: '1,003,000'
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
      { id: 'tracking', title: 'Tracking' },
      { id: 'reports', title: 'Reports' },
      { id: 'integration', title: 'Discord Integration' }
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

      <div className="container mx-auto px-4">
        <div className="flex gap-12">
          {/* Navigation Sidebar */}
          <div className="w-64 shrink-0">
            <div className="sticky top-8 space-y-8">
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
              <div id="core-features" className="space-y-6">
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
                    <RegearResult 
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
                          <img 
                            src="https://render.albiononline.com/v1/item/T8_HEAD_CLOTH_SET3.png"
                            alt="Scholar Cowl"
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
              <h2 className="text-4xl font-bold">Attendance</h2>
              <p className="text-lg text-zinc-400">Coming soon...</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
} 