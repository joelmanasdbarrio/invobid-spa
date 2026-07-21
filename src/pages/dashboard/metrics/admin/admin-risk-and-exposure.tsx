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
import {
  type AdminPlatformRiskDistributionMetric,
  type AdminTopDebtorsByExposureMetric
} from '@/types/Metrics'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'

const riskChartConfig = {
  invoices: {
    label: 'Facturas',
    color: 'var(--chart-2)'
  },
  amount: {
    label: 'Importe',
    color: 'var(--chart-1)'
  }
} satisfies ChartConfig

type RiskChartRow = {
  ratingLabel: string
  invoices: number
  amount: number
}

export function AdminRiskAndExposure ({ className }: { className?: string }) {
  const [riskDistribution, setRiskDistribution] = useState<AdminPlatformRiskDistributionMetric[]>([])
  const [topDebtors, setTopDebtors] = useState<AdminTopDebtorsByExposureMetric[]>([])

  const { locale } = useLocale()

  const chartData = useMemo<RiskChartRow[]>(() => {
    return riskDistribution.map((row) => ({
      ratingLabel: `R${row.rating}`,
      invoices: row.invoiceCount,
      amount: row.totalAmount
    }))
  }, [riskDistribution])

  useEffect(() => {
    getMetric<AdminPlatformRiskDistributionMetric[]>('a15').then(({ data }) => {
      setRiskDistribution(data)
    })

    getMetric<AdminTopDebtorsByExposureMetric[]>('a16').then(({ data }) => {
      setTopDebtors(data)
    })
  }, [])

  return (
    <Card className={cn('flex flex-col justify-between pb-2', className)}>
      <CardHeader className='items-center pb-0'>
        <CardTitle>Riesgo y exposición</CardTitle>
        <CardDescription>Distribución de rating y concentración por deudor</CardDescription>
      </CardHeader>
      <CardContent className='px-2 grid gap-2 xl:grid-cols-2'>
        <div className='min-h-64'>
          {chartData.length > 0
            ? (
              <ChartContainer config={riskChartConfig} className='h-64 w-full'>
                <BarChart accessibilityLayer data={chartData} margin={{ left: 12, right: 12, top: 12 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey='ratingLabel' tickLine={false} axisLine={false} tickMargin={8} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <Bar dataKey='invoices' fill='var(--color-invoices)' radius={4} />
                </BarChart>
              </ChartContainer>
            )
            : <div className='h-64 flex items-center justify-center text-sm text-muted-foreground'>No hay datos de riesgo</div>}
        </div>

        <div>
          <h3 className='text-sm font-medium mb-2'>Top deudores por exposición</h3>
          <div className='overflow-auto max-h-96'>
            <ul className='flex flex-col gap-2'>
              {topDebtors.slice(0, 6).map((debtor) => (
                <li key={debtor.debtorId} className='px-4 py-2 rounded-md bg-muted flex items-center justify-between gap-2'>
                  <div className='flex flex-col'>
                    <Link to={`/admin/debtors/${debtor.debtorId}`} className='text-sm font-medium hover:underline'>{debtor.companyName}</Link>
                    <span className='text-xs text-muted-foreground'>{debtor.invoiceCount} fact.</span>
                  </div>
                  <span className='text-sm font-semibold'>{formatCurrency(debtor.totalAmount, locale)}</span>
                </li>
              ))}
              {topDebtors.length === 0 && <li className='px-4 py-2 text-center text-sm text-muted-foreground'>No hay deudores con exposición</li>}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
