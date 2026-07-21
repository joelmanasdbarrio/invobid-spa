import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart'
import { useLocale } from '@/hooks/use-locale'
import { formatCurrency } from '@/lib/format-currency'
import { cn } from '@/lib/utils'
import { getMetric } from '@/services/metric.api'
import { type AdminMonthlyFinancedVolumeMetric } from '@/types/Metrics'
import { useEffect, useMemo, useState } from 'react'
import { CartesianGrid, Line, LineChart, XAxis } from 'recharts'

const monthlyFinancedChartConfig = {
  financedVolume: {
    label: 'Volumen financiado',
    color: 'var(--chart-1)'
  }
} satisfies ChartConfig

type MonthlyBarRow = {
  month: string
  financedVolume: number
}

export function AdminMonthlyFinancedVolume ({ className }: { className?: string }) {
  const [monthlyFinancedVolume, setMonthlyFinancedVolume] = useState<AdminMonthlyFinancedVolumeMetric[]>([])
  const { locale } = useLocale()

  const monthlyChartData = useMemo<MonthlyBarRow[]>(() => {
    return monthlyFinancedVolume.map((row) => ({
      month: new Date(row.month).toLocaleDateString(locale, { month: 'short', year: '2-digit' }),
      financedVolume: row.financedVolume
    }))
  }, [locale, monthlyFinancedVolume])

  useEffect(() => {
    getMetric<AdminMonthlyFinancedVolumeMetric[]>('a13').then(({ data }) => {
      setMonthlyFinancedVolume(data)
    })
  }, [])

  return (
    <Card className={cn('flex flex-col justify-between pb-2', className)}>
      <CardHeader className='items-center pb-0'>
        <CardTitle>Volumen financiado mensual</CardTitle>
        <CardDescription>Evolución mensual del importe financiado</CardDescription>
      </CardHeader>
      <CardContent className='px-2'>
        <section className='rounded-md bg-muted px-3 py-2 min-h-64'>
          <h3 className='text-sm font-medium mb-2'>Histórico mensual</h3>
          {monthlyChartData.length > 0
            ? (
              <ChartContainer config={monthlyFinancedChartConfig} className='h-56 w-full'>
                <LineChart accessibilityLayer data={monthlyChartData} margin={{ left: 4, right: 8, top: 8 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey='month' tickLine={false} axisLine={false} tickMargin={8} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value), locale)} />} />
                  <Line
                    dataKey='financedVolume'
                    type='monotone'
                    stroke='var(--color-financedVolume)'
                    strokeWidth={2}
                    dot={{ fill: 'var(--color-financedVolume)' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ChartContainer>
            )
            : <div className='h-56 flex items-center justify-center text-sm text-muted-foreground'>No hay histórico mensual</div>}
        </section>
      </CardContent>
    </Card>
  )
}
