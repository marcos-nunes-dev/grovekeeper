import { memo, useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { formatPrice } from '@/lib/utils/price'

interface PriceHistoryChartProps {
  data: Array<{
    timestamp: string
    price: number
  }>
}

type TooltipFormatter = (value: number, name: string) => [string, string]

const formatPriceForAxis = (value: number) => formatPrice(value, false)

export const PriceHistoryChart = memo(function PriceHistoryChart({ data }: PriceHistoryChartProps) {
  const formattedData = useMemo(() => 
    data.map(point => ({
      ...point,
      timestamp: new Date(point.timestamp).toLocaleDateString(undefined, {
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric'
      })
    })),
    [data]
  )

  const tooltipFormatter: TooltipFormatter = useMemo(
    () => (value) => [formatPrice(value), 'Price'],
    []
  )

  return (
    <div className="w-[300px] h-[120px] mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={formattedData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00E6B4" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#00E6B4" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="timestamp" 
            tick={{ fill: '#71717A', fontSize: 10 }} 
            tickLine={{ stroke: '#27272A' }}
            interval="preserveStartEnd"
            minTickGap={20}
          />
          <YAxis 
            tick={{ fill: '#71717A', fontSize: 10 }} 
            tickLine={{ stroke: '#27272A' }}
            tickFormatter={formatPriceForAxis}
            width={50}
          />
          <Tooltip
            contentStyle={{ 
              backgroundColor: '#1C2128', 
              border: '1px solid #27272A',
              borderRadius: '4px',
              fontSize: '12px'
            }}
            labelStyle={{ color: '#71717A' }}
            formatter={tooltipFormatter}
            labelFormatter={(label) => `Time: ${label}`}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke="#00E6B4"
            strokeWidth={1.5}
            fill="url(#priceGradient)"
            dot={false}
            activeDot={{ r: 4, fill: '#00E6B4' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}) 