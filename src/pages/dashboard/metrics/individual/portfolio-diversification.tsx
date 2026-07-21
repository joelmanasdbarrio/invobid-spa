import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useLocale } from '@/hooks/use-locale'
import { formatCurrency } from '@/lib/format-currency.ts'
import { cn } from '@/lib/utils.ts'
import { getMetric } from '@/services/metric.api.ts'
import { type PortfolioDiversificationMetric } from '@/types/Metrics'
import { useEffect, useState } from 'react'

export function PortfolioDiversification ({ className }: { className?: string }) {
  const [portfolioDiversification, setPortfolioDiversification] = useState<PortfolioDiversificationMetric | null>(null)
  const { locale } = useLocale()

  useEffect(() => {
    getMetric<PortfolioDiversificationMetric>('i17')
      .then(({ data }) => {
        setPortfolioDiversification(data)
      })
  }, [])

  if (!portfolioDiversification) return null

  return (
    <Card
      className={
        cn('flex flex-col justify-between pb-2', className)
      }
    >
      <CardHeader className='items-center pb-0'>
        <CardTitle>Diversificación de cartera</CardTitle>
        <CardDescription>Análisis de exposición y diversificación</CardDescription>
      </CardHeader>
      <CardContent className='px-2'>
        <div className='grid gap-4 md:grid-cols-2'>
          <div className='px-4 py-2 rounded-md flex flex-col bg-muted'>
            <CardDescription>Deudores únicos</CardDescription>
            <span className='text-2xl font-bold'>{portfolioDiversification.differentDebtors}</span>
          </div>
          <div className='px-4 py-2 rounded-md flex flex-col bg-muted'>
            <CardDescription>Facturas únicas</CardDescription>
            <span className='text-2xl font-bold'>{portfolioDiversification.differentInvoices}</span>
          </div>
          <div className='px-4 py-2 rounded-md flex flex-col bg-muted'>
            <CardDescription>Importe medio por factura</CardDescription>
            <span className='text-xl font-bold'>
              {formatCurrency(portfolioDiversification.averageInvoiceAmount, locale)}
            </span>
          </div>
          <div className='px-4 py-2 rounded-md flex flex-col bg-muted'>
            <CardDescription>Mayor exposición</CardDescription>
            <span className='text-lg font-bold text-chart-1'>
              {portfolioDiversification.maxDebtorExposurePercentage.toFixed(2)}%
            </span>
            <span className='text-xs text-muted-foreground'>
              {formatCurrency(portfolioDiversification.maxDebtorExposure, locale)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
