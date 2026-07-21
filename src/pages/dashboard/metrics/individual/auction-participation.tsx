import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils.ts'
import { getMetric } from '@/services/metric.api.ts'
import {
  type AuctionParticipationCountMetric,
  type AuctionSuccessRateMetric
} from '@/types/Metrics'
import { useEffect, useState } from 'react'

export function AuctionParticipation ({ className }: { className?: string }) {
  const [participatedAuctionsCount, setParticipatedAuctionsCount] = useState(0)
  const [auctionSuccessRate, setAuctionSuccessRate] = useState(0)

  useEffect(() => {
    getMetric<AuctionParticipationCountMetric>('i9')
      .then(({ data }) => {
        setParticipatedAuctionsCount(data)
      })
    getMetric<AuctionSuccessRateMetric>('i10')
      .then(({ data }) => {
        setAuctionSuccessRate(Number(data))
      })
  }, [])

  return (
    <Card
      className={
        cn('flex flex-col justify-between pb-2', className)
      }
    >
      <CardHeader className='items-center pb-0'>
        <CardTitle>Subastas</CardTitle>
        <CardDescription>Participación en subastas</CardDescription>
      </CardHeader>
      <CardContent className='px-2 grid 2xl:grid-cols-2 gap-2'>
        <div className='px-4 py-2 rounded-md flex flex-col bg-muted'>
          <CardDescription>Pujadas únicas</CardDescription>
          <span className='text-xl font-bold'>{participatedAuctionsCount}</span>
        </div>
        <div className='px-4 py-2 rounded-md flex flex-col bg-muted'>
          <CardDescription>Tasa de éxito</CardDescription>
          <span className='text-xl font-bold'>{auctionSuccessRate}%</span>
        </div>
      </CardContent>
    </Card>
  )
}
