'use client'

import React, { useMemo } from 'react'
import { TrendingUp } from 'lucide-react'
import { Pie, PieChart, Label } from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
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

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))'
]

const DeviceStats = ({ stats }) => {
  const deviceData = useMemo(() => {
    const deviceCount = stats.reduce((acc, item) => {
      if (!acc[item.device]) {
        acc[item.device] = 0
      }
      acc[item.device]++
      return acc
    }, {})

    return Object.keys(deviceCount).map((device, index) => ({
      device,
      count: deviceCount[device],
      fill: COLORS[index % COLORS.length]
    }))
  }, [stats])

  const totalDevices = useMemo(() => {
    return deviceData.reduce((acc, curr) => acc + curr.count, 0)
  }, [deviceData])

  const chartConfig = useMemo(() => {
    return deviceData.reduce(
      (acc, curr, index) => ({
        ...acc,
        [curr.device]: {
          label: curr.device,
          color: COLORS[index % COLORS.length]
        }
      }),
      {}
    )
  }, [deviceData])

  return (
    <div>
      <Card className='flex flex-col'>
        <CardHeader className='items-center pb-0'>
          <CardTitle>Device Statistics</CardTitle>
        </CardHeader>
        <CardContent className='flex-1 pb-0'>
          <ChartContainer
            config={chartConfig}
            className='mx-auto aspect-square max-h-[250px]'
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={deviceData}
                dataKey='count'
                nameKey='device'
                innerRadius={60}
                strokeWidth={5}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor='middle'
                          dominantBaseline='middle'
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className='fill-foreground text-3xl font-bold'
                          >
                            {totalDevices}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className='fill-muted-foreground'
                          >
                            Visitors
                          </tspan>
                        </text>
                      )
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}

export default DeviceStats
