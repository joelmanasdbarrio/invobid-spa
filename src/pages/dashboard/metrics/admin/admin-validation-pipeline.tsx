import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig
} from '@/components/ui/chart'
import { cn } from '@/lib/utils'
import { getMetric } from '@/services/metric.api'
import {
  type AdminAuctionsInTransitionMetric,
  type AdminPendingValidationDebtorMetric,
  type AdminPendingValidationInvoiceMetric,
  type AdminPendingValidationUserMetric
} from '@/types/Metrics'
import { useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, Cell, LabelList, XAxis, YAxis } from 'recharts'

const validationPipelineChartConfig = {
  count: {
    label: 'Total'
  }
} satisfies ChartConfig

export function AdminValidationPipeline ({ className }: { className?: string }) {
  const [pendingUsersCount, setPendingUsersCount] = useState<AdminPendingValidationUserMetric>(0)
  const [pendingDebtorsCount, setPendingDebtorsCount] = useState<AdminPendingValidationDebtorMetric>(0)
  const [pendingInvoicesCount, setPendingInvoicesCount] = useState<AdminPendingValidationInvoiceMetric>(0)
  const [transitioningAuctionsCount, setTransitioningAuctionsCount] = useState<AdminAuctionsInTransitionMetric>(0)

  useEffect(() => {
    getMetric<AdminPendingValidationUserMetric>('a2').then(({ data }) => {
      setPendingUsersCount(data)
    })

    getMetric<AdminPendingValidationDebtorMetric>('a4').then(({ data }) => {
      setPendingDebtorsCount(data)
    })

    getMetric<AdminPendingValidationInvoiceMetric>('a6').then(({ data }) => {
      setPendingInvoicesCount(data)
    })

    getMetric<AdminAuctionsInTransitionMetric>('a8').then(({ data }) => {
      setTransitioningAuctionsCount(data)
    })
  }, [])

  const chartData = useMemo(() => {
    return [
      {
        key: 'users',
        label: 'Usuarios',
        count: pendingUsersCount,
        fill: 'var(--chart-1)'
      },
      {
        key: 'debtors',
        label: 'Deudores',
        count: pendingDebtorsCount,
        fill: 'var(--chart-2)'
      },
      {
        key: 'invoices',
        label: 'Facturas',
        count: pendingInvoicesCount,
        fill: 'var(--chart-3)'
      },
      {
        key: 'auctions',
        label: 'Subastas',
        count: transitioningAuctionsCount,
        fill: 'var(--chart-4)'
      }
    ]
  }, [
    pendingUsersCount,
    pendingDebtorsCount,
    pendingInvoicesCount,
    transitioningAuctionsCount
  ])

  return (
    <Card className={cn('flex flex-col justify-between pb-2', className)}>
      <CardHeader className='items-center pb-0'>
        <CardTitle>Pipeline de validación</CardTitle>
        <CardDescription>Totales pendientes por entidad</CardDescription>
      </CardHeader>
      <CardContent className='px-2'>
        <section className='rounded-md bg-muted px-3 py-2 min-h-72'>
          <h3 className='text-sm font-medium mb-2'>Resumen operativo</h3>
          <div className='min-h-64 flex items-center justify-center'>
            <ChartContainer
              config={validationPipelineChartConfig}
              className='mx-auto w-full'
              style={{ height: 260 }}
            >
              <BarChart
                accessibilityLayer
                data={chartData}
                margin={{ top: 18, right: 8, left: 8, bottom: 8 }}
              >
                <XAxis
                  dataKey='label'
                  tickLine={false}
                  tickMargin={8}
                  axisLine={false}
                />
                <YAxis
                  dataKey='count'
                  type='number'
                  tickLine={false}
                  tickMargin={8}
                  axisLine={false}
                  width={28}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      hideLabel
                      formatter={(value, _, item) => (
                        <>
                          <span className='text-muted-foreground'>{item.payload.label}</span>
                          <span className='font-semibold tabular-nums'>{value}</span>
                        </>
                      )}
                    />
                  }
                />
                <Bar dataKey='count' radius={6}>
                  {chartData.map((row) => (
                    <Cell key={row.key} fill={row.fill} />
                  ))}
                  <LabelList
                    dataKey='count'
                    position='top'
                    className='fill-foreground text-sm font-semibold'
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          </div>
        </section>
      </CardContent>
    </Card>
  )
}
