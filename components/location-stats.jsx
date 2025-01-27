'use client'

import { TrendingUp } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart'

export default function LocationStats ({ stats = [] }) {
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
    .slice(0, 5) // Show top 5 cities

  const chartConfig = {
    count: {
      label: 'Count',
      color: 'hsl(var(--chart-3))'
    }
  }

  return (
    <div className='h-full'>  
      <Card>
        <CardHeader>
          <CardTitle>Location Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <BarChart
              accessibilityLayer
              data={chartData}
              barSize={30}
              width={500}
              height={200}
            >
              <CartesianGrid vertical={false} strokeDasharray='3 3' />
              <XAxis
                dataKey='city'
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar
                dataKey='count'
                fill='hsl(var(--chart-1))'
                radius={[5, 5, 0, 0]} // Rounded corners for top of bars
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
