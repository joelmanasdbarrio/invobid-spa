import { ColorBadge } from '@/components/color-badge'
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
  type CompanyActiveOwnAuctionMetric,
  type CompanyOwnAuctionsByStatusMetric
} from '@/types/Metrics'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { Bar, BarChart, Cell, LabelList, XAxis, YAxis } from 'recharts'
import { getAuctionStatusLabel, getStatusBadgeColor } from './status'

const auctionStatusChartConfig = {
  auctionCount: {
    label: 'Subastas',
    color: 'var(--chart-1)'
  }
} satisfies ChartConfig

type AuctionStatusChartRow = {
  status: string
  label: string
  auctionCount: number
  fill: string
}

const AUCTION_STATUS_CHART_COLORS: Record<string, string> = {
  draft: '#eab308',
  published: '#16a34a',
  transitioning: '#2563eb',
  finished: '#9333ea',
  cancelled: '#dc2626'
}

export function CompanyAuctionsOverview ({ className }: { className?: string }) {
  const [activeAuctions, setActiveAuctions] = useState<CompanyActiveOwnAuctionMetric[]>([])
  const [auctionsByStatus, setAuctionsByStatus] = useState<CompanyOwnAuctionsByStatusMetric[]>([])
  const { locale } = useLocale()

  const auctionsByStatusChartData = useMemo<AuctionStatusChartRow[]>(() => {
    return auctionsByStatus.map((row) => ({
      status: row.status,
      label: getAuctionStatusLabel(row.status),
      auctionCount: row.auctionCount,
      fill: AUCTION_STATUS_CHART_COLORS[row.status] || '#000000'
    }))
  }, [auctionsByStatus])

  useEffect(() => {
    getMetric<CompanyActiveOwnAuctionMetric[]>('c5').then(({ data }) => {
      setActiveAuctions(data)
    })
    getMetric<CompanyOwnAuctionsByStatusMetric[]>('c6').then(({ data }) => {
      setAuctionsByStatus(data)
    })
  }, [])

  return (
    <Card className={cn('flex flex-col justify-between pb-2', className)}>
      <CardHeader className='items-center pb-0'>
        <CardTitle>Subastas de empresa</CardTitle>
        <CardDescription>Subastas activas y distribución por estado</CardDescription>
      </CardHeader>
      <CardContent className='px-2 flex flex-col gap-4'>
        <div className='overflow-auto max-h-72'>
          <ul className='flex flex-col gap-2'>
            {activeAuctions.length > 0
              ? activeAuctions.map((auction) => (
                <li key={auction.id} className='px-4 py-2 rounded-md bg-muted flex flex-col gap-1'>
                  <div className='flex items-center justify-between gap-2'>
                    <ColorBadge color={getStatusBadgeColor(auction.status)}>
                      {getAuctionStatusLabel(auction.status)}
                    </ColorBadge>
                    <span className='text-xs text-muted-foreground'>Fin: {new Date(auction.dateEnd).toLocaleDateString(locale)}</span>
                  </div>
                  <div className='flex items-center justify-between gap-2'>
                    <Link to={`/auctions/${auction.id}`} className='text-sm hover:underline'>
                      Ver subasta
                    </Link>
                    <span className='text-sm font-bold'>{formatCurrency(auction.amount, locale)}</span>
                  </div>
                </li>
              ))
              : <li className='px-4 py-2 text-center text-sm text-muted-foreground'>No hay subastas activas</li>}
          </ul>
        </div>

        <div className='min-h-72 flex items-center justify-center'>
          {auctionsByStatusChartData.length > 0
            ? (
              <ChartContainer
                config={auctionStatusChartConfig}
                className='mx-auto w-full'
                style={{ height: Math.max(220, auctionsByStatusChartData.length * 52) }}
              >
                <BarChart
                  accessibilityLayer
                  data={auctionsByStatusChartData}
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
                  <XAxis dataKey='auctionCount' type='number' hide />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        labelFormatter={(_value, payload) => {
                          const data = payload?.[0]?.payload as AuctionStatusChartRow | undefined
                          return data?.label
                        }}
                      />
                    }
                  />
                  <Bar dataKey='auctionCount' radius={6}>
                    {auctionsByStatusChartData.map((row) => (
                      <Cell key={row.status} fill={row.fill} />
                    ))}
                    <LabelList
                      dataKey='auctionCount'
                      position='right'
                      className='fill-foreground text-sm font-semibold'
                    />
                  </Bar>
                </BarChart>
              </ChartContainer>
            )
            : <span className='px-4 py-2 text-center text-sm text-muted-foreground'>No hay datos de estados</span>}
        </div>
      </CardContent>
    </Card>
  )
}
