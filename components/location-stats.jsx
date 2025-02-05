'use client'

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart'

export default function LocationStats({ stats = [] }) {
  const cityCount = stats.reduce((acc, item) => {
    if (acc[item.city]) {
      acc[item.city] += 1
    } else {
      acc[item.city] = 1
    }
    return acc
  }, {})

  const chartData = Object.entries(cityCount)
    .map(([city, count]) => ({
      city,
      count
    }))
    .sort((a, b) => b.count - a.count) // Sort by count in descending order
    .slice(0, 5) // Show top 5 cities

  const chartConfig = {
    count: {
      label: 'Clicks',
      color: 'hsl(var(--chart-1))'
    }
  }

  return (
    <Card className="bg-white/[0.02] border-white/[0.08]">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white/90">Geographic Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ChartContainer config={chartConfig}>
              <BarChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 0,
                  left: 0,
                  bottom: 20,
                }}
                barSize={40}
              >
                <CartesianGrid 
                  vertical={false} 
                  strokeDasharray="3 3" 
                  stroke="rgba(255,255,255,0.1)"
                />
                <XAxis
                  dataKey="city"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                />
                <YAxis 
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                />
                <ChartTooltip
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  content={<ChartTooltipContent />}
                />
                <Bar
                  dataKey="count"
                  fill="hsl(220, 70%, 50%)"
                  radius={[4, 4, 0, 0]}
                />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgb(99, 102, 241)" />
                    <stop offset="100%" stopColor="rgb(244, 63, 94)" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ChartContainer>
          </ResponsiveContainer>
        </div>

        <div className="mt-6 space-y-2">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-white/80">{item.city}</span>
              <span className="text-sm font-medium text-white/90">{item.count} clicks</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}