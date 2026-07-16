import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useLocale } from '@/hooks/use-locale'
import { formatCurrency } from '@/lib/format-currency'
import { cn } from '@/lib/utils'
import { getMetric } from '@/services/metric.api'
import { type CompanyInvestorActivityMetric } from '@/types/Metrics'
import { useEffect, useState } from 'react'

export function CompanyOperationsSummary ({ className }: { className?: string }) {
  const [avgTimeToFinanceDays, setAvgTimeToFinanceDays] = useState(0)
  const [investorActivity, setInvestorActivity] = useState<CompanyInvestorActivityMetric>({
    companyInvestorVolume: 0,
    companyAcquiredInvoices: 0
  })
  const { locale } = useLocale()

  useEffect(() => {
    getMetric<number>('c12').then(({ data }) => {
      setAvgTimeToFinanceDays(data)
    })
    getMetric<CompanyInvestorActivityMetric>('c13').then(({ data }) => {
      setInvestorActivity(data)
    })
  }, [])

  return (
    <Card className={cn('flex flex-col justify-between pb-2', className)}>
      <CardHeader className='items-center pb-0'>
        <CardTitle>Resumen operativo</CardTitle>
        <CardDescription>Tiempo medio de financiación y actividad inversora</CardDescription>
      </CardHeader>
      <CardContent className='px-2 grid gap-2 xl:grid-cols-3'>
        <div className='px-4 py-2 rounded-md flex flex-col bg-muted'>
          <CardDescription>Tiempo medio hasta financiación</CardDescription>
          <span className='text-xl font-bold'>{avgTimeToFinanceDays.toFixed(2)} dias</span>
        </div>
        <div className='px-4 py-2 rounded-md flex flex-col bg-muted'>
          <CardDescription>Volumen como inversor</CardDescription>
          <span className='text-xl font-bold'>{formatCurrency(investorActivity.companyInvestorVolume, locale)}</span>
        </div>
        <div className='px-4 py-2 rounded-md flex flex-col bg-muted'>
          <CardDescription>Facturas adquiridas</CardDescription>
          <span className='text-xl font-bold'>{investorActivity.companyAcquiredInvoices}</span>
        </div>
      </CardContent>
    </Card>
  )
}
