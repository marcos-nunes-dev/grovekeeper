'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Calculator, Users, UserCircle, AlertCircle, Heart, Search, Clock, Swords, Skull, Shield, ExternalLink } from 'lucide-react'
import { motion } from 'framer-motion'
import { Input } from "@/components/ui/input"
import { formatTimeAgo, formatFame } from '@/lib/utils/format'
import { useProfileStats } from '@/lib/hooks/useProfileStats'
import { AnimatedCounter } from '@/components/ui/animated-counter'

export default function Home() {
  const { data: stats } = useProfileStats()

  return (
    <div className="min-h-screen bg-[#0A0E14] flex flex-col -mt-4">
      {/* Disclaimer Banner */}
      <div className="bg-[#00A884]/10 border-b border-[#00A884]/20 px-4 py-2">
        <div className="container mx-auto">
          <p className="text-sm text-center flex items-center justify-center gap-2">
            <AlertCircle className="h-4 w-4 text-[#00A884]" />
            <span>
              Grovekeeper is a fan-made tool and is not affiliated with or endorsed by Sandbox Interactive GmbH
            </span>
          </p>
        </div>
      </div>

      {/* Main Content Wrapper */}
      <div className="flex-grow">
        {/* Hero Section */}
        <motion.section 
          className="relative min-h-[calc(100vh-40px)] flex items-center justify-center overflow-hidden bg-[#0D1117]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <div className="absolute inset-0 w-full h-full">
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E14] via-[#0D1117]/50 to-transparent" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 bg-[#00A884]/5 rounded-full px-4 py-1 mb-8 backdrop-blur-sm border border-[#00A884]/20"
              >
                <span className="inline-block w-2 h-2 rounded-full bg-white animate-pulse" />
                <span className="text-sm text-[#00A884]">Announcing our new Regear Calculator</span>
              </motion.div>

              <motion.h1 
                className="text-5xl md:text-7xl font-bold mb-6 tracking-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Tools for{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00A884] via-[#00A884] to-[#1B9E7A]">
                  Albion Online
                </span>{' '}
                players
              </motion.h1>
              
              <motion.p 
                className="text-xl md:text-2xl text-zinc-400 mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                The best way to track, analyze, and optimize your Albion Online gameplay. 
                Built for players, guilds, and alliances.
              </motion.p>

              <motion.div 
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button asChild size="lg" className="bg-[#00A884] text-black hover:bg-[#1B9E7A]">
                  <Link href="/profile">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-[#00A884]/20 hover:border-[#00A884]/40">
                  <Link href="/docs">
                    Documentation
                  </Link>
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Features Section */}
        <section className="py-32 px-4 bg-[#0A0E14]">
          <div className="container mx-auto">
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <FeatureCard
                icon={<Calculator className="h-6 w-6 text-[#00A884]" />}
                title="Regear Calculator"
                description="Calculate regear costs instantly. Track your guild's economy with precision."
              />
              <FeatureCard
                icon={<Users className="h-6 w-6 text-[#00A884]" />}
                title="Attendance Tracker"
                description="Monitor ZvZ participation. Reward active players. Build stronger teams."
              />
              <FeatureCard
                icon={<UserCircle className="h-6 w-6 text-[#00A884]" />}
                title="Player Profiles"
                description="Analyze player performance. Track progress. Identify improvement areas."
              />
            </motion.div>
          </div>
        </section>

        {/* Player Search Section */}
        <section className="py-32 px-4 bg-[#0D1117] border-t border-[#00A884]/5">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="max-w-4xl mx-auto text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Track Your Progress
              </h2>
              <p className="text-xl text-zinc-400">
                Enter your player name to view detailed statistics, recent activities, and performance metrics.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="max-w-4xl mx-auto"
            >
              {/* Search Form */}
              <Card className="bg-[#161B22] border-[#00A884]/20 hover:border-[#00A884]/40 transition-colors mb-8">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                      <Input
                        placeholder="Enter player name"
                        className="pl-10 bg-[#0D1117]/50 border-zinc-800 focus:border-[#00A884] focus:ring-[#00A884] text-white"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const input = e.target as HTMLInputElement
                            window.location.href = `/profile?name=${encodeURIComponent(input.value)}`
                          }
                        }}
                      />
                    </div>
                    <Button 
                      className="w-full bg-[#00A884] text-black hover:bg-[#1B9E7A]"
                      onClick={() => {
                        const input = document.querySelector('input') as HTMLInputElement
                        if (input.value) {
                          window.location.href = `/profile?name=${encodeURIComponent(input.value)}`
                        }
                      }}
                    >
                      View Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activities */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg px-1">Recent Activities</h3>
                <div className="space-y-3">
                  {[
                    {
                      id: '1',
                      killer: {
                        name: "Arthemis",
                        guild_name: "Blood Raiders",
                        alliance_name: "ARCH",
                        item_power: 1250,
                        damage_done: 15000,
                        healing_done: 5000
                      },
                      victim: {
                        name: "DarkWarrior",
                        guild_name: "Shadow Legion",
                        alliance_name: "POE"
                      },
                      time: Date.now() - 120000, // 2 minutes ago
                      total_kill_fame: 150000,
                      participant_count: 15,
                      tags: { fair: true, is_zvz: true }
                    },
                    {
                      id: '2',
                      killer: {
                        name: "BlackWolf",
                        guild_name: "Frostborn",
                        alliance_name: "SURF",
                        item_power: 1150,
                        damage_done: 12000,
                        healing_done: 3000
                      },
                      victim: {
                        name: "LightBringer",
                        guild_name: "Dawn Brigade",
                        alliance_name: "SQUAD"
                      },
                      time: Date.now() - 300000, // 5 minutes ago
                      total_kill_fame: 75000,
                      participant_count: 8,
                      tags: { fair: true, is_5v5: true }
                    },
                    {
                      id: '3',
                      killer: {
                        name: "ShadowMage",
                        guild_name: "Mystic Order",
                        alliance_name: "BA",
                        item_power: 1350,
                        damage_done: 18000,
                        healing_done: 8000
                      },
                      victim: {
                        name: "StormCaller",
                        guild_name: "Thunder Clan",
                        alliance_name: "CIR"
                      },
                      time: Date.now() - 600000, // 10 minutes ago
                      total_kill_fame: 250000,
                      participant_count: 25,
                      tags: { fair: true, is_zvz: true }
                    }
                  ].map((event) => (
                    <Card 
                      key={event.id}
                      className="bg-[#0D1117] border-zinc-800/50 p-3 rounded-lg hover:border-[#00A884]/20 transition-all cursor-pointer"
                      onClick={() => window.location.href = `/profile?name=${encodeURIComponent(event.killer.name)}`}
                    >
                      <div className="flex flex-col gap-3">
                        {/* Top row - Time and match type */}
                        <div className="flex items-center justify-between text-xs text-zinc-500">
                          <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            {formatTimeAgo(event.time)}
                            {event.tags.fair && <span className="text-green-500">(Fair Fight)</span>}
                            {event.tags.is_zvz ? 'ZvZ' : event.tags.is_5v5 ? '5v5' : 'PvP'}
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-3 h-3" />
                            {event.participant_count} Players
                          </div>
                        </div>

                        {/* Player info and match stats */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col items-center">
                              <div className="flex items-center gap-2">
                                <Swords className="w-4 h-4 text-green-500" />
                                <div className="text-sm font-medium">
                                  {event.killer.name}
                                </div>
                              </div>
                              <div className="text-xs text-zinc-500">
                                {event.killer.guild_name}
                                {event.killer.alliance_name && ` [${event.killer.alliance_name}]`}
                              </div>
                            </div>
                            <div className="text-sm text-zinc-400">vs</div>
                            <div className="flex flex-col items-center">
                              <div className="flex items-center gap-2">
                                <Skull className="w-4 h-4 text-red-500" />
                                <div className="text-sm font-medium">
                                  {event.victim.name}
                                </div>
                              </div>
                              <div className="text-xs text-zinc-500">
                                {event.victim.guild_name}
                                {event.victim.alliance_name && ` [${event.victim.alliance_name}]`}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="flex flex-col items-center">
                              <div className="text-lg font-bold">
                                {formatFame(event.total_kill_fame)}
                              </div>
                              <div className="text-xs text-zinc-400">FAME</div>
                            </div>
                            <div className="flex flex-col items-center">
                              <div className="text-lg font-bold">
                                {event.killer.item_power}
                              </div>
                              <div className="text-xs text-zinc-400">IP</div>
                            </div>
                          </div>
                        </div>

                        {/* Bottom row - Combat stats */}
                        <div className="flex items-center justify-between text-xs text-zinc-500">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <Shield className="w-3 h-3 text-blue-400" />
                              {formatFame(event.killer.damage_done)} Damage
                            </div>
                            <div className="flex items-center gap-1">
                              <Heart className="w-3 h-3 text-green-400" />
                              {formatFame(event.killer.healing_done)} Healing
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 p-0 text-xs text-zinc-400 hover:text-zinc-300"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`https://albiononline.com/en/killboard/kill/${event.id}`, '_blank');
                            }}
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Details
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-32 px-4 border-t border-[#00A884]/5 bg-[#0D1117]">
          <div className="container mx-auto">
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <StatCard 
                number={<AnimatedCounter value={stats?.playersTracked || 0} />} 
                label="Players Tracked" 
              />
              <StatCard 
                number={<AnimatedCounter value={stats?.silverCalculated || 0} />} 
                label="Silver Calculated" 
              />
              <StatCard 
                number={<AnimatedCounter value={stats?.deathsAnalyzed || 0} />} 
                label="Deaths Analyzed" 
              />
              <StatCard 
                number={<AnimatedCounter value={stats?.totalPvpFame || 0} />} 
                label="Total PvP Fame" 
              />
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-4 border-t border-[#00A884]/5 bg-gradient-to-b from-[#0D1117] to-[#0A0E14]">
          <div className="container mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="max-w-2xl mx-auto"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to optimize your gameplay?
              </h2>
              <p className="text-xl text-zinc-400 mb-12">
                Join thousands of players who are already using Grovekeeper to enhance their Albion Online experience.
              </p>
              <Button asChild size="lg" className="bg-[#00A884] text-black hover:bg-[#1B9E7A]">
                <Link href="/regear-calculator">
                  Calculate Regear
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>
      </div>      
    </div>
  )
}

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) {
  return (
    <Card className="bg-[#161B22] border-[#00A884]/20 hover:border-[#00A884]/40 transition-colors p-6">
      <CardContent className="p-0">
        <div className="bg-[#00A884]/10 rounded-lg p-3 w-fit mb-4">
          {icon}
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-zinc-400">{description}</p>
      </CardContent>
    </Card>
  )
}

function StatCard({ number, label }: { number: React.ReactNode; label: string }) {
  return (
    <div className="space-y-2">
      <div className="text-4xl font-bold text-[#00A884]">{number}</div>
      <div className="text-zinc-400">{label}</div>
    </div>
  )
}

