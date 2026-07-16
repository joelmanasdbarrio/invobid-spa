import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useLocale } from '@/hooks/use-locale'
import { formatCurrency } from '@/lib/format-currency'
import { cn } from '@/lib/utils'
import { getMetric } from '@/services/metric.api'
import { type CompanyReceivedBidsMetric } from '@/types/Metrics'
import { useEffect, useState } from 'react'

export function CompanyReceivedBids ({ className }: { className?: string }) {
  const [receivedBids, setReceivedBids] = useState<CompanyReceivedBidsMetric>({
    receivedBidsCount: 0,
    receivedBidAmount: 0
  })
  const { locale } = useLocale()

  useEffect(() => {
    getMetric<CompanyReceivedBidsMetric>('c7').then(({ data }) => {
      setReceivedBids(data)
    })
  }, [])

  return (
    <Card className={cn('flex flex-col justify-between pb-2', className)}>
      <CardHeader className='items-center pb-0'>
        <CardTitle>Pujas recibidas</CardTitle>
        <CardDescription>Total de pujas y volumen ofertado</CardDescription>
      </CardHeader>
      <CardContent className='px-2 grid gap-2'>
        <div className='px-4 py-2 rounded-md flex flex-col bg-muted'>
          <CardDescription>Número de pujas</CardDescription>
          <span className='text-2xl font-bold'>{receivedBids.receivedBidsCount}</span>
        </div>
        <div className='px-4 py-2 rounded-md flex flex-col bg-muted'>
          <CardDescription>Importe total ofertado</CardDescription>
          <span className='text-2xl font-bold'>{formatCurrency(receivedBids.receivedBidAmount, locale)}</span>
        </div>
      </CardContent>
    </Card>
  )
}
