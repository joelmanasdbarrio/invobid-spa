import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useLocale } from '@/hooks/use-locale'
import { formatCurrency } from '@/lib/format-currency'
import { formatPercentage } from '@/lib/format-percentage'
import { cn } from '@/lib/utils'
import { getMetric } from '@/services/metric.api'
import {
  type AdminAuctionToFinanceConversionMetric,
  type AdminOverduePendingInvoicesMetric,
  type AdminPlatformTotalFinancedVolumeMetric
} from '@/types/Metrics'
import { useEffect, useState } from 'react'

export function AdminPlatformOverview ({ className }: { className?: string }) {
  const [platformTotals, setPlatformTotals] = useState<AdminPlatformTotalFinancedVolumeMetric>({
    platformTotalFinancedVolume: 0,
    platformFinancedInvoicesCount: 0
  })
  const [estimatedPlatformFees, setEstimatedPlatformFees] = useState(0)
  const [activeInvestors, setActiveInvestors] = useState(0)
  const [conversion, setConversion] = useState<AdminAuctionToFinanceConversionMetric>({
    auctionedInvoices: 0,
    financedInvoices: 0,
    auctionToFinanceConversion: 0
  })
  const [overdue, setOverdue] = useState<AdminOverduePendingInvoicesMetric>({
    overdueInvoices: 0,
    overdueAmount: 0
  })

  const { locale } = useLocale()

  useEffect(() => {
    getMetric<AdminPlatformTotalFinancedVolumeMetric>('a9').then(({ data }) => {
      setPlatformTotals(data)
    })

    getMetric<number>('a10').then(({ data }) => {
      setEstimatedPlatformFees(data)
    })

    getMetric<number>('a11').then(({ data }) => {
      setActiveInvestors(data)
    })

    getMetric<AdminAuctionToFinanceConversionMetric>('a12').then(({ data }) => {
      setConversion(data)
    })

    getMetric<AdminOverduePendingInvoicesMetric>('a14').then(({ data }) => {
      setOverdue(data)
    })
  }, [])

  return (
    <Card className={cn('flex flex-col justify-between pb-2', className)}>
      <CardHeader className='items-center pb-0'>
        <CardTitle>Resumen de plataforma</CardTitle>
        <CardDescription>Financiación, comisiones, conversión y mora</CardDescription>
      </CardHeader>
      <CardContent className='px-2 grid gap-2 lg:grid-cols-2 xl:grid-cols-3'>
        <div className='px-4 py-2 rounded-md flex flex-col bg-muted'>
          <CardDescription>Inversores activos</CardDescription>
          <span className='text-xl font-bold'>{activeInvestors}</span>
          <span className='text-xs text-muted-foreground'>con al menos una puja</span>
        </div>

        <div className='px-4 py-2 rounded-md flex flex-col bg-muted'>
          <CardDescription>Facturas vencidas pendientes</CardDescription>
          <div className='flex flex-col justify-between'>
            <span className='text-xl font-bold'>{overdue.overdueInvoices}</span>
            <span className='text-sm text-muted-foreground wrap-normal'>Importe: {formatCurrency(overdue.overdueAmount, locale)}</span>
          </div>
        </div>

        <div className='px-4 py-2 rounded-md flex flex-col bg-muted'>
          <CardDescription>Conversión subasta → financiación</CardDescription>
          <span className='text-xl font-bold'>{formatPercentage(conversion.auctionToFinanceConversion, locale)}</span>
          <span className='text-xs text-muted-foreground'>{conversion.financedInvoices} / {conversion.auctionedInvoices} facturas</span>
        </div>

        <div className='px-4 py-2 rounded-md flex flex-col bg-muted'>
          <CardDescription>Comisiones estimadas</CardDescription>
          <span className='text-xl font-bold'>{formatCurrency(estimatedPlatformFees, locale)}</span>
          <span className='text-xs text-muted-foreground'>a partir de operaciones financiadas</span>
        </div>

        <div className='px-4 py-2 rounded-md flex flex-col bg-muted lg:col-span-2'>
          <CardDescription>Volumen total financiado</CardDescription>
          <span className='text-xl font-bold'>{formatCurrency(platformTotals.platformTotalFinancedVolume, locale)}</span>
          <span className='text-xs text-muted-foreground'>{platformTotals.platformFinancedInvoicesCount} facturas financiadas</span>
        </div>
      </CardContent>
    </Card>
  )
}
