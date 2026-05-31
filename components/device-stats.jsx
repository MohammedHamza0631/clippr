'use client'

import React, { useMemo } from 'react'
import { Label, Pie, PieChart } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import {
  CHART_COLORS,
  PIE_INNER_RADIUS,
  PIE_OUTER_RADIUS,
  PIE_PADDING_ANGLE,
  PIE_STROKE_WIDTH,
} from '@/lib/constants'

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
      fill: CHART_COLORS[index % CHART_COLORS.length],
    }))
  }, [stats])

  const totalDevices = useMemo(() => {
    return deviceData.reduce((acc, curr) => acc + curr.count, 0)
  }, [deviceData])

  const chartConfig = useMemo(() => {
    return deviceData.reduce((acc, curr, index) => {
      acc[curr.device] = { label: curr.device, color: CHART_COLORS[index % CHART_COLORS.length] }
      return acc
    }, {})
  }, [deviceData])

  return (
    <Card className="bg-white/[0.02] border-white/[0.08]">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white/90">Device Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[300px]">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={deviceData}
              dataKey="count"
              nameKey="device"
              innerRadius={PIE_INNER_RADIUS}
              outerRadius={PIE_OUTER_RADIUS}
              strokeWidth={PIE_STROKE_WIDTH}
              paddingAngle={PIE_PADDING_ANGLE}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-white text-3xl font-bold"
                        >
                          {totalDevices}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-white/60 text-sm"
                        >
                          Total Clicks
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>

        <div className="mt-6 space-y-2">
          {deviceData.map((item) => (
            <div key={item.device} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.fill }} />
                <span className="text-sm text-white/80">{item.device}</span>
              </div>
              <span className="text-sm font-medium text-white/90">{item.count}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default DeviceStats
