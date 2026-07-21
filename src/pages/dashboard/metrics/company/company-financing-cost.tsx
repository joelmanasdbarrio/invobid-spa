import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useLocale } from '@/hooks/use-locale'
import { formatCurrency } from '@/lib/format-currency'
import { cn } from '@/lib/utils'
import { getMetric } from '@/services/metric.api'
import { type CompanyAverageFinancingCostMetric } from '@/types/Metrics'
import { useEffect, useState } from 'react'

function formatPercentage (value: number) {
  return `${value.toLocaleString('es-ES', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })}%`
}

export function CompanyFinancingCost ({ className }: { className?: string }) {
  const [financingCost, setFinancingCost] = useState<CompanyAverageFinancingCostMetric>({
    averageDiscount: 0,
    averageInvestorProfitability: 0
  })
  const [sellerFeesAmount, setSellerFeesAmount] = useState(0)
  const { locale } = useLocale()

  useEffect(() => {
    getMetric<CompanyAverageFinancingCostMetric>('c8').then(({ data }) => {
      setFinancingCost(data)
    })
    getMetric<number>('c9').then(({ data }) => {
      setSellerFeesAmount(data)
    })
  }, [])

  return (
    <Card className={cn('flex flex-col justify-between pb-2', className)}>
      <CardHeader className='items-center pb-0'>
        <CardTitle>Coste de financiación</CardTitle>
        <CardDescription>Descuento, rentabilidad y comisiones estimadas</CardDescription>
      </CardHeader>
      <CardContent className='px-2 grid gap-2 lg:grid-cols-3'>
        <div className='px-4 py-2 rounded-md flex flex-col bg-muted'>
          <CardDescription>Descuento medio</CardDescription>
          <span className='text-xl font-bold'>{formatPercentage(financingCost.averageDiscount)}</span>
        </div>
        <div className='px-4 py-2 rounded-md flex flex-col bg-muted'>
          <CardDescription>Rentabilidad inversor media</CardDescription>
          <span className='text-xl font-bold'>{formatPercentage(financingCost.averageInvestorProfitability)}</span>
        </div>
        <div className='px-4 py-2 rounded-md flex flex-col bg-muted'>
          <CardDescription>Comision estimada vendedor</CardDescription>
          <span className='text-xl font-bold'>{formatCurrency(sellerFeesAmount, locale)}</span>
        </div>
      </CardContent>
    </Card>
  )
}
