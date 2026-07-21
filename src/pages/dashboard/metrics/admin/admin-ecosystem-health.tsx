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
  type AdminDebtorsByStatusMetric,
  type AdminUsersByStatusAndTypeMetric
} from '@/types/Metrics'
import { useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, Cell, LabelList, XAxis, YAxis } from 'recharts'
import { getDebtorStatusLabel } from '../company/status'

const ecosystemChartConfig = {
  count: {
    label: 'Cantidad',
    color: 'var(--chart-1)'
  }
} satisfies ChartConfig

const usersByStatusChartConfig = {
  individualCount: {
    label: 'Individual',
    color: 'var(--chart-2)'
  },
  companyCount: {
    label: 'Empresa',
    color: 'var(--chart-4)'
  }
} satisfies ChartConfig

type UsersChartRow = {
  status: string
  label: string
  individualCount: number
  companyCount: number
}

type DebtorsChartRow = {
  status: string
  label: string
  debtorsCount: number
  fill: string
}

function getUserStatusLabel (status: string): string {
  switch (status) {
    case 'pending':
      return 'Pendiente'
    case 'verified':
      return 'Verificado'
    case 'correction':
      return 'En corrección'
    case 'denied':
      return 'Denegado'
    default:
      return status
  }
}

function getChartColorByStatus (status: string): string {
  switch (status) {
    case 'pending':
      return 'var(--chart-2)'
    case 'verified':
      return 'var(--chart-1)'
    case 'correction':
      return 'var(--chart-3)'
    case 'denied':
      return 'var(--chart-5)'
    default:
      return 'var(--chart-2)'
  }
}

export function AdminEcosystemHealth ({ className }: { className?: string }) {
  const [usersByStatusAndType, setUsersByStatusAndType] = useState<AdminUsersByStatusAndTypeMetric[]>([])
  const [debtorsByStatus, setDebtorsByStatus] = useState<AdminDebtorsByStatusMetric[]>([])

  const usersChartData = useMemo<UsersChartRow[]>(() => {
    const grouped = new Map<string, UsersChartRow>()

    for (const row of usersByStatusAndType) {
      if (row.type !== 'investor') continue

      const existing = grouped.get(row.status) ?? {
        status: row.status,
        label: getUserStatusLabel(row.status),
        individualCount: 0,
        companyCount: 0
      }

      if (row.investorType === 'individual') {
        existing.individualCount += row.usersCount
      }

      if (row.investorType === 'company') {
        existing.companyCount += row.usersCount
      }

      grouped.set(row.status, existing)
    }

    return Array.from(grouped.values())
  }, [usersByStatusAndType])

  const debtorsChartData = useMemo<DebtorsChartRow[]>(() => {
    return debtorsByStatus.map((row) => ({
      status: row.status,
      label: getDebtorStatusLabel(row.status),
      debtorsCount: row.debtorsCount,
      fill: getChartColorByStatus(row.status)
    }))
  }, [debtorsByStatus])

  useEffect(() => {
    getMetric<AdminUsersByStatusAndTypeMetric[]>('a1').then(({ data }) => {
      setUsersByStatusAndType(data)
    })

    getMetric<AdminDebtorsByStatusMetric[]>('a3').then(({ data }) => {
      setDebtorsByStatus(data)
    })
  }, [])

  return (
    <Card className={cn('flex flex-col justify-between pb-2', className)}>
      <CardHeader className='items-center pb-0'>
        <CardTitle>Salud del ecosistema</CardTitle>
        <CardDescription>Usuarios y deudores por estado</CardDescription>
      </CardHeader>
      <CardContent className='px-2 grid gap-2 xl:grid-cols-2'>
        <section className='rounded-md bg-muted px-3 py-2 min-h-72'>
          <h3 className='text-sm font-medium mb-2'>Usuarios por estado y tipo</h3>
          <div className='min-h-64 flex items-center justify-center'>
            {usersChartData.length > 0
              ? (
                <ChartContainer
                  config={usersByStatusChartConfig}
                  className='h-56 w-full'
                >
                  <BarChart
                    accessibilityLayer
                    data={usersChartData}
                    margin={{ left: 4, right: 8, top: 8 }}
                  >
                    <XAxis dataKey='label' tickLine={false} axisLine={false} tickMargin={8} interval={0} />
                    <YAxis />
                    <ChartTooltip
                      cursor={false}
                      content={
                        <ChartTooltipContent
                          labelFormatter={(_value, payload) => {
                            const data = payload?.[0]?.payload as UsersChartRow | undefined
                            return data?.label
                          }}
                        />
                      }
                    />
                    <Bar dataKey='individualCount' fill='var(--color-individualCount)' radius={4} />
                    <Bar dataKey='companyCount' fill='var(--color-companyCount)' radius={4} />
                  </BarChart>
                </ChartContainer>
              )
              : <span className='px-4 py-2 text-center text-sm text-muted-foreground'>No hay datos de usuarios</span>}
          </div>
        </section>

        <section className='rounded-md bg-muted px-3 py-2 min-h-72'>
          <h3 className='text-sm font-medium mb-2'>Deudores por estado</h3>
          <div className='min-h-64 flex items-center justify-center'>
            {debtorsChartData.length > 0
              ? (
                <ChartContainer
                  config={ecosystemChartConfig}
                  className='mx-auto w-full max-w-[460px]'
                  style={{ height: 240 }}
                >
                  <BarChart
                    accessibilityLayer
                    data={debtorsChartData}
                    margin={{ top: 15, right: 24, left: 12, bottom: 8 }}
                  >
                    <XAxis
                      dataKey='label'
                      tickLine={false}
                      tickMargin={8}
                      axisLine={false}
                      interval={0}
                    />
                    <YAxis tickLine={false} axisLine={false} />
                    <ChartTooltip
                      cursor={false}
                      content={
                        <ChartTooltipContent
                          labelFormatter={(_value, payload) => {
                            const data = payload?.[0]?.payload as DebtorsChartRow | undefined
                            return data?.label
                          }}
                        />
                      }
                    />
                    <Bar dataKey='debtorsCount' radius={6}>
                      {debtorsChartData.map((row) => (
                        <Cell key={row.status} fill={row.fill} />
                      ))}
                      <LabelList
                        dataKey='debtorsCount'
                        position='top'
                        className='fill-foreground text-sm font-semibold'
                      />
                    </Bar>
                  </BarChart>
                </ChartContainer>
              )
              : <span className='px-4 py-2 text-center text-sm text-muted-foreground'>No hay datos de deudores</span>}
          </div>
        </section>
      </CardContent>
    </Card>
  )
}
