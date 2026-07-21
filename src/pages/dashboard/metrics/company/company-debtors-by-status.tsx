import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart'
import { cn } from '@/lib/utils'
import { getMetric } from '@/services/metric.api'
import { type CompanyDebtorsByStatusMetric } from '@/types/Metrics'
import { useEffect, useState } from 'react'
import { Bar, BarChart, Cell, LabelList, XAxis, YAxis } from 'recharts'
import { getDebtorStatusLabel } from './status'

const debtorStatusChartConfig = {
  debtorCount: {
    label: 'Deudores',
    color: 'var(--chart-1)'
  }
} satisfies ChartConfig

type DebtorStatusChartRow = {
  status: string
  label: string
  debtorCount: number
  fill: string
}

const DEBTOR_STATUS_CHART_COLORS: Record<string, string> = {
  pending: '#eab308',
  verified: '#16a34a',
  correction: '#2563eb',
  denied: '#dc2626'
}

export function CompanyDebtorsByStatus ({ className }: { className?: string }) {
  const [debtorsByStatus, setDebtorsByStatus] = useState<CompanyDebtorsByStatusMetric[]>([])

  useEffect(() => {
    getMetric<CompanyDebtorsByStatusMetric[]>('c10').then(({ data }) => {
      setDebtorsByStatus(data)
    })
  }, [])

  const chartData: DebtorStatusChartRow[] = debtorsByStatus.map((row) => ({
    status: row.status,
    label: getDebtorStatusLabel(row.status),
    debtorCount: row.debtorCount,
    fill: DEBTOR_STATUS_CHART_COLORS[row.status] || '#000000'
  }))

  return (
    <Card className={cn('flex flex-col justify-between pb-2', className)}>
      <CardHeader className='items-center pb-0'>
        <CardTitle>Deudores por estado</CardTitle>
        <CardDescription>Distribucion de deudores de la empresa</CardDescription>
      </CardHeader>
      <CardContent className='px-2'>
        <div className='min-h-48 flex items-center justify-center'>
          {chartData.length > 0
            ? (
              <ChartContainer
                config={debtorStatusChartConfig}
                className='mx-auto w-full'
                style={{ height: Math.max(180, chartData.length * 52) }}
              >
                <BarChart
                  accessibilityLayer
                  data={chartData}
                  layout='vertical'
                  margin={{ top: 8, right: 24, left: 12, bottom: 8 }}
                >
                  <YAxis
                    dataKey='label'
                    type='category'
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    width={90}
                  />
                  <XAxis dataKey='debtorCount' type='number' hide />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        labelFormatter={(_value, payload) => {
                          const data = payload?.[0]?.payload as DebtorStatusChartRow | undefined
                          return data?.label
                        }}
                      />
                    }
                  />
                  <Bar dataKey='debtorCount' radius={6}>
                    {chartData.map((row) => (
                      <Cell key={row.status} fill={row.fill} />
                    ))}
                    <LabelList
                      dataKey='debtorCount'
                      position='right'
                      className='fill-foreground text-sm font-semibold'
                    />
                  </Bar>
                </BarChart>
              </ChartContainer>
            )
            : <span className='px-4 py-2 text-center text-sm text-muted-foreground'>No hay deudores para mostrar</span>}
        </div>
      </CardContent>
    </Card>
  )
}
