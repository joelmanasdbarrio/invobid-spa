import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { formatCurrency } from '@/lib/format-currency.ts'
import { cn } from '@/lib/utils.ts'
import { getMetric } from '@/services/metric.api.ts'
import { type AverageRatingMetric, type RiskDistributionMetric } from '@/types/Metrics'
import { useEffect, useState } from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

const chartConfig = {
  totalAmount: {
    label: 'Exposición',
    color: 'var(--chart-2)'
  }
} satisfies ChartConfig

export function RiskDistribution ({ className }: { className?: string }) {
  const [data, setData] = useState<RiskDistributionMetric[]>([])
  const [averageRating, setAverageRating] = useState(0)

  useEffect(() => {
    getMetric<RiskDistributionMetric[]>('i14').then(({ data }) => {
      setData(data)
    })
    getMetric<AverageRatingMetric>('i15').then(({ data }) => {
      setAverageRating(data)
    })
  }, [])

  return (
    <Card className={cn('flex flex-col pt-2', className)}>
      <CardHeader className='items-center pb-0 pe-2 flex justify-between'>
        <div>
          <CardTitle>Distribución de riesgo</CardTitle>
          <CardDescription>Importe financiado por nivel de rating</CardDescription>
        </div>
        <div className='px-4 py-2 rounded-md flex flex-col bg-muted'>
          <span className='text-sm text-muted-foreground'>Rating medio</span>
          <span className='block text-lg font-bold text-foreground'>{averageRating.toFixed(2)}</span>
        </div>
      </CardHeader>
      <CardContent className='flex-1 pb-4 pt-4'>
        <ChartContainer config={chartConfig} className='w-full h-[220px]'>
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey='rating'
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value: number) => formatCurrency(value)}
              width={80}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  formatter={(value, _name, item) => {
                    const entry = item?.payload as RiskDistributionMetric | undefined
                    return (
                      <div className='flex flex-col gap-1'>
                        <span className='text-muted-foreground'>Volumen</span>
                        <span className='font-mono font-medium text-foreground'>
                          {formatCurrency(Number(value))}
                        </span>
                        <span className='text-muted-foreground'>Facturas</span>
                        <span className='font-mono font-medium text-foreground'>
                          {entry?.invoiceCount ?? 0}
                        </span>
                      </div>
                    )
                  }}
                />
              }
            />
            <Bar dataKey='totalAmount' fill='var(--chart-2)' radius={8} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
