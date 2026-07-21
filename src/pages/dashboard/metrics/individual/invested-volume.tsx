import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/format-currency.ts'
import { cn } from '@/lib/utils.ts'
import { getMetric } from '@/services/metric.api.ts'
import { type TotalInvestedCountMetric, type TotalInvestedVolumeMetric } from '@/types/Metrics'
import { useEffect, useState } from 'react'

export function InvestedVolume ({ className }: { className?: string }) {
  const [totalInvestedVolume, setTotalInvestedVolume] = useState(0)
  const [totalInvestedCount, setTotalInvestedCount] = useState(0)

  useEffect(() => {
    getMetric<TotalInvestedVolumeMetric>('i2')
      .then(({ data }) => {
        setTotalInvestedVolume(data)
      })
    getMetric<TotalInvestedCountMetric>('i3')
      .then(({ data }) => {
        setTotalInvestedCount(data)
      })
  }, [])

  return (
    <Card
      className={
        cn('flex flex-col justify-between pb-2', className)
      }
    >
      <CardHeader className='items-center pb-0'>
        <CardTitle>Facturas financiadas</CardTitle>
        <CardDescription>Volumen y número total de facturas financiadas / invertidas</CardDescription>
      </CardHeader>
      <CardContent className='px-2 grid 2xl:grid-cols-[1fr_auto] gap-4'>
        <div className='px-4 py-2 rounded-md flex flex-col bg-muted'>
          <CardDescription>Volumen total</CardDescription>
          <span className='text-xl font-bold'>{formatCurrency(totalInvestedVolume)}</span>
        </div>
        <div className='px-4 py-2 rounded-md flex flex-col bg-muted'>
          <CardDescription>Número total</CardDescription>
          <span className='text-xl font-bold'>{totalInvestedCount}</span>
        </div>
      </CardContent>
    </Card>
  )
}
