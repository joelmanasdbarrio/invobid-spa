import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart'
import { cn } from '@/lib/utils'
import { getMetric } from '@/services/metric.api'
import {
  type AdminAuctionsByStatusMetric,
  type AdminInvoicesByStatusMetric
} from '@/types/Metrics'
import { useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from 'recharts'
import {
  getAuctionStatusLabel,
  getInvoiceStatusLabel
} from '../company/status'

const invoiceStatusChartConfig = {
  totalAmount: {
    label: 'Volumen',
    color: 'var(--chart-1)'
  },
  invoiceCount: {
    label: 'Cantidad',
    color: 'var(--chart-2)'
  }
} satisfies ChartConfig

const auctionStatusChartConfig = {
  auctionCount: {
    label: 'Subastas',
    color: 'var(--chart-2)'
  }
} satisfies ChartConfig

type InvoiceStatusBarRow = {
  status: string
  totalAmount: number
  invoiceCount: number
}

type AuctionStatusPieRow = {
  status: string
  auctionCount: number
  fill: string
}

function getAuctionStatusChartColor (status: string): string {
  switch (status) {
    case 'published':
      return 'var(--chart-4)'
    case 'transitioning':
      return 'var(--chart-2)'
    case 'finished':
      return 'var(--chart-1)'
    case 'cancelled':
      return 'var(--chart-5)'
    case 'draft':
      return 'var(--chart-3)'
    default:
      return 'var(--chart-5)'
  }
}

export function AdminLifecycleTrends ({ className }: { className?: string }) {
  const [invoiceStatuses, setInvoiceStatuses] = useState<AdminInvoicesByStatusMetric[]>([])
  const [auctionStatuses, setAuctionStatuses] = useState<AdminAuctionsByStatusMetric[]>([])

  const invoiceStatusChartData = useMemo<InvoiceStatusBarRow[]>(() => {
    return invoiceStatuses.map((row) => ({
      status: getInvoiceStatusLabel(row.status),
      totalAmount: row.totalAmount,
      invoiceCount: row.invoiceCount
    }))
  }, [invoiceStatuses])

  const auctionStatusChartData = useMemo<AuctionStatusPieRow[]>(() => {
    return auctionStatuses.map((row) => ({
      status: getAuctionStatusLabel(row.status),
      auctionCount: row.auctionCount,
      fill: getAuctionStatusChartColor(row.status)
    }))
  }, [auctionStatuses])

  useEffect(() => {
    getMetric<AdminInvoicesByStatusMetric[]>('a5').then(({ data }) => {
      setInvoiceStatuses(data)
    })

    getMetric<AdminAuctionsByStatusMetric[]>('a7').then(({ data }) => {
      setAuctionStatuses(data)
    })
  }, [])

  return (
    <Card className={cn('flex flex-col justify-between pb-2', className)}>
      <CardHeader className='items-center pb-0'>
        <CardTitle>Ciclo operativo</CardTitle>
        <CardDescription>Estados de facturas/subastas y evolución mensual financiada</CardDescription>
      </CardHeader>
      <CardContent className='px-2 grid gap-2 xl:grid-cols-5'>
        <section className='rounded-md bg-muted px-3 py-2 min-h-64 xl:col-span-3'>
          <h3 className='text-sm font-medium mb-2'>Facturas por estado</h3>
          {invoiceStatusChartData.length > 0
            ? (
              <ChartContainer config={invoiceStatusChartConfig} className='h-56 w-full'>
                <BarChart accessibilityLayer data={invoiceStatusChartData} margin={{ left: 4, right: 8, top: 8 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey='status' tickLine={false} axisLine={false} tickMargin={8} interval={0} />
                  <YAxis yAxisId='left' />
                  <YAxis yAxisId='right' orientation='right' />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <Bar dataKey='totalAmount' fill='var(--color-totalAmount)' radius={4} yAxisId='left' />
                  <Bar dataKey='invoiceCount' fill='var(--color-invoiceCount)' radius={4} yAxisId='right' />
                </BarChart>
              </ChartContainer>
            )
            : <div className='h-56 flex items-center justify-center text-sm text-muted-foreground'>No hay datos de facturas</div>}
        </section>

        <section className='rounded-md bg-muted px-3 py-2 min-h-64 xl:col-span-2'>
          <h3 className='text-sm font-medium mb-2'>Subastas por estado</h3>
          {auctionStatusChartData.length > 0
            ? (
              <div className='flex flex-col gap-3'>
                <ChartContainer config={auctionStatusChartConfig} className='h-56 w-full'>
                  <PieChart>
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                    <Pie
                      data={auctionStatusChartData}
                      dataKey='auctionCount'
                      nameKey='status'
                      innerRadius={45}
                      strokeWidth={4}
                    >
                      {auctionStatusChartData.map((row) => (
                        <Cell key={row.status} fill={row.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
                <div className='flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground'>
                  {auctionStatusChartData.map((row) => (
                    <div key={row.status} className='flex items-center gap-2'>
                      <span
                        className='h-2.5 w-2.5 rounded-sm'
                        style={{ backgroundColor: row.fill }}
                      />
                      <span>{row.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
            : <div className='h-56 flex items-center justify-center text-sm text-muted-foreground'>No hay datos de subastas</div>}
        </section>
      </CardContent>
    </Card>
  )
}
