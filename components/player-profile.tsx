import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Share2, Sword, Users, Coins, History } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Image from 'next/image'

interface PlayerProfileProps {
  playerName: string
  region: string
}

// Mock fame progression data
const fameData = [
  { date: '12/13', fame: 20000 },
  { date: '12/14', fame: 22000 },
  { date: '12/15', fame: 21000 },
  { date: '12/16', fame: 25000 },
  { date: '12/17', fame: 28000 },
  { date: '12/18', fame: 27000 },
  { date: '12/19', fame: 32000 },
]

// Mock ZvZ data
const zvzData = [
  { date: '12/15', wins: 2, losses: 1 },
  { date: '12/16', wins: 3, losses: 2 },
  { date: '12/17', wins: 4, losses: 0 },
  { date: '12/18', wins: 1, losses: 2 },
  { date: '12/19', wins: 5, losses: 1 },
  { date: '12/20', wins: 3, losses: 1 },
  { date: '12/21', wins: 2, losses: 2 },
]

// Mock recent activities
const recentActivities = [
  {
    type: 'ZvZ',
    result: 'Victory',
    time: '2 hours ago',
    kills: 5,
    deaths: 1,
    assists: 12,
    fame: 150000,
    equipment: {
      mainHand: 'T8_MAIN_SPEAR',
      offHand: 'T8_OFF_SHIELD',
      head: 'T8_HEAD_PLATE',
      chest: 'T8_ARMOR_PLATE',
      shoes: 'T8_SHOES_PLATE',
      cape: 'T8_CAPE',
    },
    allies: ['Player1', 'Player2', 'Player3'],
    enemies: ['Enemy1', 'Enemy2', 'Enemy3'],
  },
  {
    type: 'Ganking',
    result: 'Defeat',
    time: '3 hours ago',
    kills: 1,
    deaths: 1,
    assists: 2,
    fame: 50000,
    equipment: {
      mainHand: 'T8_2H_CLAWPAIR',
      head: 'T8_HEAD_LEATHER',
      chest: 'T8_ARMOR_LEATHER',
      shoes: 'T8_SHOES_LEATHER',
      cape: 'T8_CAPE',
    },
    allies: ['Player4', 'Player5'],
    enemies: ['Enemy4', 'Enemy5'],
  },
  {
    type: 'ZvZ',
    result: 'Victory',
    time: '5 hours ago',
    kills: 3,
    deaths: 0,
    assists: 8,
    fame: 120000,
    equipment: {
      mainHand: 'T8_MAIN_SPEAR',
      offHand: 'T8_OFF_SHIELD',
      head: 'T8_HEAD_PLATE',
      chest: 'T8_ARMOR_PLATE',
      shoes: 'T8_SHOES_PLATE',
      cape: 'T8_CAPE',
    },
    allies: ['Player1', 'Player2', 'Player3'],
    enemies: ['Enemy1', 'Enemy2', 'Enemy3'],
  },
  {
    type: 'Ganking',
    result: 'Victory',
    time: '6 hours ago',
    kills: 2,
    deaths: 0,
    assists: 1,
    fame: 80000,
    equipment: {
      mainHand: 'T8_2H_CLAWPAIR',
      head: 'T8_HEAD_LEATHER',
      chest: 'T8_ARMOR_LEATHER',
      shoes: 'T8_SHOES_LEATHER',
      cape: 'T8_CAPE',
    },
    allies: ['Player4', 'Player5'],
    enemies: ['Enemy4'],
  },
  {
    type: 'ZvZ',
    result: 'Defeat',
    time: '8 hours ago',
    kills: 2,
    deaths: 1,
    assists: 5,
    fame: 90000,
    equipment: {
      mainHand: 'T8_MAIN_SPEAR',
      offHand: 'T8_OFF_SHIELD',
      head: 'T8_HEAD_PLATE',
      chest: 'T8_ARMOR_PLATE',
      shoes: 'T8_SHOES_PLATE',
      cape: 'T8_CAPE',
    },
    allies: ['Player1', 'Player2', 'Player3'],
    enemies: ['Enemy1', 'Enemy2', 'Enemy3'],
  },
]

// Mock guild history data
const guildHistory = [
  { id: 1, name: "Albion Elites", joinDate: "2023-12-01", leaveDate: "Present", duration: "20 days" },
  { id: 2, name: "Silver Wolves", joinDate: "2023-10-15", leaveDate: "2023-11-30", duration: "46 days" },
  { id: 3, name: "Iron Guardians", joinDate: "2023-08-01", leaveDate: "2023-10-14", duration: "74 days" },
  { id: 4, name: "Newbie Adventures", joinDate: "2023-06-15", leaveDate: "2023-07-31", duration: "46 days" },
]

export default function PlayerProfile({ playerName, region }: PlayerProfileProps) {
  // Calculate ZvZ stats
  const zvzStats = {
    total: zvzData.reduce((sum, day) => sum + day.wins + day.losses, 0),
    wins: zvzData.reduce((sum, day) => sum + day.wins, 0),
    losses: zvzData.reduce((sum, day) => sum + day.losses, 0),
  }

  // Calculate ganking stats
  const gankingStats = {
    kills: 45,
    deaths: 12,
    silverEarned: 25000000,
    silverLost: 8000000,
  }

  return (
    <div className="grid grid-cols-12 gap-4">
      {/* Left Sidebar */}
      <div className="col-span-3 space-y-4">
        {/* Player Info Card */}
        <Card className="bg-[#0D1117] border-zinc-800/50 p-4 rounded-lg">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative w-16 h-16 rounded-full bg-[#1C2128] border border-zinc-800/50 overflow-hidden">
                <Image
                  src={`https://render.albiononline.com/v1/player/${playerName}/avatar?quality=0`}
                  alt={playerName}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-xl font-bold">{playerName}</h2>
                <p className="text-sm text-zinc-400">{region}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-zinc-400">Guild</span>
                <span>Albion Elites</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Alliance</span>
                <span>Top Alliances</span>
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>PvP Fame</span>
                  <span className="text-[#00E6B4]">5.2M</span>
                </div>
                <Progress value={72} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>PvE Fame</span>
                  <span className="text-[#00E6B4]">25M</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Gathering Fame</span>
                  <span className="text-[#00E6B4]">12M</span>
                </div>
                <Progress value={45} className="h-2" />
              </div>
            </div>
          </div>
        </Card>

        {/* Fame Progression Graph */}
        <Card className="bg-[#0D1117] border-zinc-800/50 p-4 rounded-lg">
          <h3 className="font-semibold mb-4">Fame Progression</h3>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={fameData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <CartesianGrid stroke="#27272a" strokeDasharray="4" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#71717a" 
                  axisLine={false} 
                  tickLine={false}
                  fontSize={12}
                />
                <YAxis 
                  stroke="#71717a" 
                  axisLine={false} 
                  tickLine={false} 
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1C2128',
                    border: '1px solid rgba(39, 39, 42, 0.5)',
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="fame" 
                  stroke="#00E6B4" 
                  dot={false}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Guild History Widget */}
        <Card className="bg-[#0D1117] border-zinc-800/50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <History className="h-5 w-5 text-[#00E6B4]" />
            <h3 className="font-semibold">Guild History</h3>
          </div>
          <div className="space-y-4">
            {guildHistory.map((guild) => (
              <div key={guild.id} className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={`/placeholder.svg?text=${guild.name.charAt(0)}`} />
                  <AvatarFallback>{guild.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{guild.name}</span>
                    <span className="text-xs text-zinc-400">{guild.duration}</span>
                  </div>
                  <div className="text-xs text-zinc-400">
                    {guild.joinDate} - {guild.leaveDate}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <div className="col-span-9 space-y-3">
        <h3 className="font-semibold text-lg px-1">Recent Activities</h3>
        
        {recentActivities.map((activity, index) => (
          <Card key={index} className={`bg-[#0D1117] border-zinc-800/50 p-3 rounded-lg ${
            activity.result === 'Victory' ? 'border-green-500/20' : 'border-red-500/20'
          }`}>
            <div className="flex items-center gap-4">
              {/* Activity Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-sm font-medium ${activity.result === 'Victory' ? 'text-green-500' : 'text-red-500'}`}>
                    {activity.result}
                  </span>
                  <span className="text-sm text-zinc-400">{activity.type}</span>
                  <span className="text-sm text-zinc-400">{activity.time}</span>
                </div>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-2xl font-bold">
                    {activity.kills}/{activity.deaths}/{activity.assists}
                  </div>
                  <div className="text-sm text-zinc-400">
                    {activity.fame.toLocaleString()} Fame
                  </div>
                </div>

                {/* Equipment */}
                <div className="flex gap-2">
                  {Object.entries(activity.equipment).map(([slot, item], i) => (
                    <div key={i} className="w-10 h-10 bg-zinc-900 rounded border border-zinc-800">
                      <Image
                        src={`https://render.albiononline.com/v1/item/${item}.png`}
                        alt={slot}
                        width={40}
                        height={40}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Players */}
              <div className="flex gap-8">
                <div className="space-y-1">
                  {activity.allies.map((ally, i) => (
                    <div key={i} className="text-sm text-zinc-400">{ally}</div>
                  ))}
                </div>
                <div className="space-y-1">
                  {activity.enemies.map((enemy, i) => (
                    <div key={i} className="text-sm text-zinc-400">{enemy}</div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Performance Stats */}
      <div className="col-span-12 grid grid-cols-2 gap-4">
        {/* ZvZ Performance */}
        <Card className="bg-[#0D1117] border-zinc-800/50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-5 w-5 text-[#00E6B4]" />
            <h3 className="font-semibold">ZvZ Performance (Last 7 Days)</h3>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{zvzStats.total}</div>
              <div className="text-sm text-zinc-400">Total Battles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{zvzStats.wins}</div>
              <div className="text-sm text-zinc-400">Victories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{zvzStats.losses}</div>
              <div className="text-sm text-zinc-400">Defeats</div>
            </div>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={zvzData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <CartesianGrid stroke="#27272a" strokeDasharray="4" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#71717a" 
                  axisLine={false} 
                  tickLine={false}
                  fontSize={12}
                />
                <YAxis 
                  stroke="#71717a" 
                  axisLine={false} 
                  tickLine={false}
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1C2128',
                    border: '1px solid rgba(39, 39, 42, 0.5)',
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                />
                <Bar 
                  dataKey="wins" 
                  stackId="battles"
                  fill="#00E6B4"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                  name="Victories"
                />
                <Bar 
                  dataKey="losses" 
                  stackId="battles"
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                  name="Defeats"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Ganking Performance */}
        <Card className="bg-[#0D1117] border-zinc-800/50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Sword className="h-5 w-5 text-[#00E6B4]" />
            <h3 className="font-semibold">Ganking Performance</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-zinc-400">K/D Ratio</span>
                <span className="text-lg font-bold">{(gankingStats.kills / gankingStats.deaths).toFixed(2)}</span>
              </div>
              <div className="flex gap-2 text-sm">
                <span className="text-green-500">{gankingStats.kills} kills</span>
                <span className="text-zinc-400">/</span>
                <span className="text-red-500">{gankingStats.deaths} deaths</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Coins className="h-4 w-4 text-[#00E6B4]" />
                <span className="text-sm text-zinc-400">Silver Balance</span>
              </div>
              <div className="space-y-1">
                <div className="text-sm">
                  <span className="text-green-500">+{gankingStats.silverEarned.toLocaleString()}</span>
                </div>
                <div className="text-sm">
                  <span className="text-red-500">-{gankingStats.silverLost.toLocaleString()}</span>
                </div>
                <div className="text-sm font-bold">
                  = {(gankingStats.silverEarned - gankingStats.silverLost).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={fameData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <CartesianGrid stroke="#27272a" strokeDasharray="4" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#71717a" 
                  axisLine={false} 
                  tickLine={false}
                  fontSize={12}
                />
                <YAxis 
                  stroke="#71717a" 
                  axisLine={false} 
                  tickLine={false}
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1C2128',
                    border: '1px solid rgba(39, 39, 42, 0.5)',
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="fame" 
                  stroke="#00E6B4" 
                  dot={false}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  )
}

