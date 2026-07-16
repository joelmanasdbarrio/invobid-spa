import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip
} from '@/components/ui/chart'
import { useLocale } from '@/hooks/use-locale'
import { useIsMobile } from '@/hooks/use-mobile'
import { formatCurrency } from '@/lib/format-currency'
import { cn } from '@/lib/utils'
import { getMetric } from '@/services/metric.api'
import {
  type CompanyFinancedOwnInvoicesVolumeMetric,
  type CompanyInvoicesByStatusMetric,
  type CompanyPublishedInvoicesVolumeMetric
} from '@/types/Metrics'
import { useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

const invoiceStatusChartConfig = {
  volume: {
    label: 'Volumen',
    color: 'var(--chart-1)'
  },
  count: {
    label: 'Cantidad',
    color: 'var(--chart-2)'
  }
} satisfies ChartConfig

type BarChartRow = {
  status: string
  volume: number
  count: number
}

function getStatusLabel (status: string): string {
  const statusLabels: Record<string, string> = {
    verified: 'Verificada',
    pending: 'Pendiente',
    correction: 'En corrección',
    denied: 'Denegada'
  }
  return statusLabels[status] || status
}

function CustomTooltip ({ active, payload }: any) {

  const { locale } = useLocale()

  if (!active || !payload?.length) return null

  const data = payload[0].payload as BarChartRow

  return (
    <div className='rounded-lg border border-border bg-background p-3 shadow-md'>
      <p className='font-medium'>{data.status}</p>
      <p className='text-sm text-chart-1'>
        Volumen: {formatCurrency(data.volume, locale)}
      </p>
      <p className='text-sm text-chart-2'>
        Cantidad: {data.count}
      </p>
    </div>
  )
}

export function CompanyInvoicesOverview ({ className }: { className?: string }) {
  const [invoicesByStatus, setInvoicesByStatus] = useState<CompanyInvoicesByStatusMetric[]>([])
  const [published, setPublished] = useState<CompanyPublishedInvoicesVolumeMetric>({
    publishedInvoicesVolume: 0,
    publishedInvoicesCount: 0
  })
  const [financed, setFinanced] = useState<CompanyFinancedOwnInvoicesVolumeMetric>({
    financedOwnInvoicesVolume: 0,
    financedOwnInvoicesCount: 0
  })
  const { locale } = useLocale()
  const isMobile = useIsMobile()

  const barChartData = useMemo<BarChartRow[]>(() => {
    return invoicesByStatus.map((row) => ({
      status: getStatusLabel(row.status),
      volume: Number(row.totalAmount),
      count: row.invoiceCount
    }))
  }, [invoicesByStatus])

  useEffect(() => {
    getMetric<CompanyInvoicesByStatusMetric[]>('c1').then(({ data }) => {
      setInvoicesByStatus(data)
    })
    getMetric<CompanyPublishedInvoicesVolumeMetric>('c2').then(({ data }) => {
      setPublished(data)
    })
    getMetric<CompanyFinancedOwnInvoicesVolumeMetric>('c3').then(({ data }) => {
      setFinanced(data)
    })
  }, [])

  return (
    <Card className={cn('flex flex-col justify-between pb-2', className)}>
      <CardHeader className='items-center pb-0'>
        <CardTitle>Facturas de empresa</CardTitle>
        <CardDescription>Resumen global y distribución por estado</CardDescription>
      </CardHeader>
      <CardContent className='px-2 flex flex-col gap-2'>
        <div className='grid gap-2 xl:grid-cols-2'>
          <div className='px-4 py-2 rounded-md flex flex-col bg-muted'>
            <CardDescription>Volumen total publicado</CardDescription>
            <span className='text-lg font-bold'>{formatCurrency(published.publishedInvoicesVolume, locale)}</span>
            <span className='text-xs text-muted-foreground'>{published.publishedInvoicesCount} facturas</span>
          </div>
          <div className='px-4 py-2 rounded-md flex flex-col bg-muted'>
            <CardDescription>Volumen financiado</CardDescription>
            <span className='text-lg font-bold'>{formatCurrency(financed.financedOwnInvoicesVolume, locale)}</span>
            <span className='text-xs text-muted-foreground'>{financed.financedOwnInvoicesCount} facturas</span>
          </div>
        </div>
        <div className='min-h-56 flex items-center justify-center'>
          {barChartData.length > 0
            ? (
              <ChartContainer
                config={invoiceStatusChartConfig}
                className='mx-auto h-56 w-full'
              >
                <BarChart
                  accessibilityLayer
                  data={barChartData}
                  margin={{ top: 10, right: -30, left: 0, bottom: isMobile ? 35 : -10 }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey='status'
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    angle={isMobile ? -35 : 0}
                    textAnchor={isMobile ? 'end' : 'middle'}
                    interval={0}
                    height={isMobile ? 30 : 50}
                  />
                  <YAxis yAxisId='left' />
                  <YAxis yAxisId='right' orientation='right' />
                  <ChartTooltip
                    cursor={false}
                    content={<CustomTooltip />}
                  />
                  <Bar dataKey='volume' fill='var(--color-volume)' radius={4} yAxisId='left' />
                  <Bar dataKey='count' fill='var(--color-count)' radius={4} yAxisId='right' />
                </BarChart>
              </ChartContainer>
            )
            : <span className='px-4 py-2 text-center text-sm text-muted-foreground'>No hay facturas para mostrar</span>}
        </div>
      </CardContent>
    </Card>
  )
}
