import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { type ChartConfig, ChartContainer } from '@/components/ui/chart'
import { cn } from '@/lib/utils.ts'
import { getMetric } from '@/services/metric.api'
import {
  type AverageProfitabilityMetric,
  type NextYearExpectedProfitabilityMetric,
  type YearProfitabilityMetric
} from '@/types/Metrics'
import { useEffect, useState } from 'react'
import { Label, PolarGrid, PolarRadiusAxis, RadialBar, RadialBarChart } from 'recharts'

const chartConfig = {
  averageProfitability: {
    label: 'Rentabilidad media',
    color: 'var(--chart-1)'
  },
  yearProfitability: {
    label: 'Rentabilidad anual',
    color: 'var(--chart-2)'
  },
  nextYearExpectedProfitability: {
    label: 'Rentabilidad esperada',
    color: 'var(--chart-3)'
  }
} satisfies ChartConfig

function formatPercentage (value: number) {
  return `${value.toLocaleString('es-ES', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })}%`
}

export function AverageProfitability ({ className }: { className?: string }) {
  const [averageProfitability, setAverageProfitability] = useState(0)
  const [yearProfitability, setYearProfitability] = useState(0)
  const [nextYearExpectedProfitability, setNextYearExpectedProfitability] = useState(0)

  useEffect(() => {
    getMetric<AverageProfitabilityMetric>('i5')
      .then(({ data }) => {
        setAverageProfitability(data)
      })
    getMetric<YearProfitabilityMetric>('i6')
      .then(({ data }) => {
        setYearProfitability(data)
      })
    getMetric<NextYearExpectedProfitabilityMetric>('i7')
      .then(({ data }) => {
        setNextYearExpectedProfitability(data)
      })
  }, [])

  return (
    <Card
      className={
        cn('flex flex-col pb-0', className)
      }
    >
      <CardHeader className='items-center pb-0'>
        <CardTitle>Rentabilidad</CardTitle>
        <CardDescription>Rentabilidad de las operaciones financiadas, ponderada por importe</CardDescription>
      </CardHeader>
      <CardContent className='flex-1 pb-0 px-0'>
        <div className='grid grid-cols-1 lg:grid-cols-3'>
          <ChartContainer
            config={chartConfig}
            className='mx-auto aspect-square w-full max-h-[250px]'
          >
            <RadialBarChart
              data={[
                {
                  metric: 'averageProfitability',
                  value: averageProfitability,
                  fill: 'var(--color-averageProfitability)'
                }
              ]}
              endAngle={averageProfitability * 3.6}
              innerRadius={60}
            >
              <PolarGrid
                gridType='circle'
                radialLines={false}
                stroke='none'
                className='first:fill-muted last:fill-background'
                polarRadius={[82, 70]}
              />
              <RadialBar dataKey='value' background cornerRadius={8} barSize={12} />
              <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
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
                            className='fill-foreground text-xl font-bold'
                          >
                            {formatPercentage(averageProfitability)}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 20}
                            className='fill-muted-foreground'
                          >
                            Media
                          </tspan>
                        </text>
                      )
                    }
                  }}
                />
              </PolarRadiusAxis>
            </RadialBarChart>
          </ChartContainer>
          <ChartContainer
            config={chartConfig}
            className='mx-auto aspect-square w-full max-h-[250px]'
          >
            <RadialBarChart
              data={[
                {
                  metric: 'yearProfitability',
                  value: yearProfitability,
                  fill: 'var(--color-yearProfitability)'
                }
              ]}
              endAngle={yearProfitability * 3.6}
              innerRadius={60}
            >
              <PolarGrid
                gridType='circle'
                radialLines={false}
                stroke='none'
                className='first:fill-muted last:fill-background'
                polarRadius={[82, 70]}
              />
              <RadialBar dataKey='value' background cornerRadius={8} barSize={12} />
              <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
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
                            className='fill-foreground text-xl font-bold'
                          >
                            {formatPercentage(yearProfitability)}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 20}
                            className='fill-muted-foreground'
                          >
                            Anual
                          </tspan>
                        </text>
                      )
                    }
                  }}
                />
              </PolarRadiusAxis>
            </RadialBarChart>
          </ChartContainer>
          <ChartContainer
            config={chartConfig}
            className='mx-auto aspect-square w-full max-h-[250px] sm:col-span-2 md:col-span-1'
          >
            <RadialBarChart
              data={[
                {
                  metric: 'nextYearExpectedProfitability',
                  value: nextYearExpectedProfitability,
                  fill: 'var(--color-nextYearExpectedProfitability)'
                }
              ]}
              endAngle={nextYearExpectedProfitability * 3.6}
              innerRadius={60}
            >
              <PolarGrid
                gridType='circle'
                radialLines={false}
                stroke='none'
                className='first:fill-muted last:fill-background'
                polarRadius={[82, 70]}
              />
              <RadialBar dataKey='value' background cornerRadius={8} barSize={12} />
              <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
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
                            className='fill-foreground text-xl font-bold'
                          >
                            {formatPercentage(nextYearExpectedProfitability)}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 20}
                            className='fill-muted-foreground'
                          >
                            Próximo año
                          </tspan>
                        </text>
                      )
                    }
                  }}
                />
              </PolarRadiusAxis>
            </RadialBarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}
