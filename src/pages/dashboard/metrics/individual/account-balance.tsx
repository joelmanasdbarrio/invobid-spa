import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart'
import { formatCurrency } from '@/lib/format-currency.ts'
import { cn } from '@/lib/utils.ts'
import { getMetric } from '@/services/metric.api.ts'
import { type AccountBalanceDataItem, type AccountBalanceMetric } from '@/types/Metrics'
import * as React from 'react'
import { useEffect, useState } from 'react'
import { Label, Pie, PieChart } from 'recharts'

const chartConfig = {
  availableBalance: {
    label: 'Saldo contable',
    color: 'var(--chart-2)'
  },
  reservedBalance: {
    label: 'Saldo reservado',
    color: 'var(--chart-3)'
  }
} satisfies ChartConfig

export function AccountBalance ({ className }: { className?: string }) {
  const [accountBalance, setAccountBalance] = useState<AccountBalanceMetric>({ availableBalance: 0, reservedBalance: 0 })
  const [accountBalanceData, setAccountBalanceData] = useState<AccountBalanceDataItem[]>([])

  useEffect(() => {
    getMetric<AccountBalanceMetric>('i1')
      .then(({ data }) => {
        setAccountBalance(data)
        const accountBalanceMetric = Object.entries(data).map(([type, value]) => {
          const numericValue = Number(value)
          return {
            name: type,
            type,
            value: numericValue,
            formattedValue: formatCurrency(numericValue),
            fill: `var(--color-${type})`
          }
        })
        setAccountBalanceData(accountBalanceMetric)
      })
  }, [])

  const totalBalance = React.useMemo(() => {
    return Object.values(accountBalance).map(value => Number(value)).reduce(
      (acc: number, value: number) => acc + value,
      0
    )
  }, [accountBalance])

  return (
    <Card
      className={
        cn('flex flex-col pb-4', className)
      }
    >
      <CardHeader className='items-center pb-0'>
        <CardTitle>Saldo de la cuenta</CardTitle>
        <CardDescription>Desglose del saldo actual de tu cuenta</CardDescription>
      </CardHeader>
      <CardContent className='flex-1 pb-0 px-0'>
        <ChartContainer
          config={chartConfig}
          className='mx-auto aspect-square max-h-[250px]'
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  nameKey='name'
                  formatter={(value, _type, item) => {
                    const data = item?.payload as typeof accountBalanceData[0] | undefined
                    const config = chartConfig[data?.type as keyof typeof chartConfig]
                    return (
                      <div className='flex flex-col gap-1'>
                        <span className='text-muted-foreground'>
                          {config?.label || data?.type}
                        </span>
                        <span className='font-mono font-medium text-foreground'>
                          {data?.formattedValue || value}
                        </span>
                      </div>
                    )
                  }}
                />
              }
            />
            <Pie
              data={accountBalanceData}
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
                          y={viewBox.cy - 20}
                          className='fill-foreground text-xl font-bold'
                        >
                          {formatCurrency(totalBalance)}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0)}
                          className='fill-muted-foreground'
                        >
                          Saldo total
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
            <ChartLegend
              content={<ChartLegendContent nameKey='name' />}
              className='-translate-y-2 flex-wrap gap-4 *:justify-center'
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
