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
import { type AdminAggregatedBankAccountBalancesMetric } from '@/types/Metrics'
import { useEffect, useMemo, useState } from 'react'
import { Label, Pie, PieChart } from 'recharts'

const usersBalanceChartConfig = {
  availableBalance: {
    label: 'Saldo disponible usuarios',
    color: 'var(--chart-2)'
  },
  reservedBalance: {
    label: 'Saldo reservado usuarios',
    color: 'var(--chart-3)'
  }
} satisfies ChartConfig

type UsersBalanceSlice = {
  name: string
  value: number
  fill: string
}

export function AdminAggregatedBalances ({ className }: { className?: string }) {
  const [balances, setBalances] = useState<AdminAggregatedBankAccountBalancesMetric[]>([])
  const { locale } = useLocale()

  const usersBalances = useMemo(() => {
    return balances.find((row) => row.platform === false)
  }, [balances])

  const platformBalances = useMemo(() => {
    return balances.find((row) => row.platform === true)
  }, [balances])

  const usersBalanceChartData = useMemo<UsersBalanceSlice[]>(() => {
    if (!usersBalances) return []

    const availableBalance = Math.max(usersBalances.totalBalance - usersBalances.totalReservedBalance, 0)

    return [
      {
        name: 'availableBalance',
        value: availableBalance,
        fill: 'var(--color-availableBalance)'
      },
      {
        name: 'reservedBalance',
        value: usersBalances.totalReservedBalance,
        fill: 'var(--color-reservedBalance)'
      }
    ]
  }, [usersBalances])

  useEffect(() => {
    getMetric<AdminAggregatedBankAccountBalancesMetric[]>('a17').then(({ data }) => {
      setBalances(data)
    })
  }, [])

  return (
    <Card className={cn('flex flex-col justify-between pb-2', className)}>
      <CardHeader className='items-center pb-0'>
        <CardTitle>Balances agregados</CardTitle>
        <CardDescription>Saldo consolidado de usuarios y plataforma</CardDescription>
      </CardHeader>
      <CardContent className='px-2 flex flex-col gap-2'>
        <section className='grid gap-2'>
          <div className='rounded-md bg-muted px-4 py-3 flex flex-col'>
            <CardDescription>Saldo plataforma</CardDescription>
            <span className='text-xl font-bold'>
              {platformBalances ? formatCurrency(platformBalances.totalBalance, locale) : formatCurrency(0, locale)}
            </span>
          </div>
        </section>

        <section className='rounded-md bg-muted px-3 py-2 min-h-64'>
          <h3 className='text-sm font-medium mb-2'>Balance de usuarios</h3>
          {usersBalances && usersBalanceChartData.length > 0
            ? (
              <ChartContainer config={usersBalanceChartConfig} className='mx-auto h-56 w-full'>
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        nameKey='name'
                        formatter={(value, _key, item) => {
                          const slice = item?.payload as UsersBalanceSlice | undefined
                          const label = usersBalanceChartConfig[slice?.name as keyof typeof usersBalanceChartConfig]?.label ?? slice?.name

                          return (
                            <div className='flex flex-col gap-1'>
                              <span className='text-muted-foreground'>{label}</span>
                              <span className='font-mono font-medium text-foreground'>
                                {formatCurrency(Number(value), locale)}
                              </span>
                            </div>
                          )
                        }}
                      />
                    }
                  />
                  <Pie
                    data={usersBalanceChartData}
                    dataKey='value'
                    nameKey='name'
                    innerRadius={60}
                    strokeWidth={5}
                  >
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
                                y={viewBox.cy - 16}
                                className='fill-foreground text-lg font-bold'
                              >
                                {formatCurrency(usersBalances.totalBalance, locale)}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={viewBox.cy + 4}
                                className='fill-muted-foreground text-xs'
                              >
                                Balance total usuarios
                              </tspan>
                            </text>
                          )
                        }
                      }}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>
            )
            : <div className='h-56 flex items-center justify-center text-sm text-muted-foreground'>No hay balance de usuarios</div>}
        </section>
      </CardContent>
    </Card>
  )
}
