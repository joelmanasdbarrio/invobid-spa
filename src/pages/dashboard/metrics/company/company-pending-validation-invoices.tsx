import { ColorBadge } from '@/components/color-badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useLocale } from '@/hooks/use-locale'
import { formatCurrency } from '@/lib/format-currency'
import { cn } from '@/lib/utils'
import { getMetric } from '@/services/metric.api'
import { type CompanyPendingValidationInvoiceMetric } from '@/types/Metrics'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { getInvoiceStatusLabel, getStatusBadgeColor } from './status'

export function CompanyPendingValidationInvoices ({ className }: { className?: string }) {
  const [invoices, setInvoices] = useState<CompanyPendingValidationInvoiceMetric[]>([])
  const { locale } = useLocale()

  useEffect(() => {
    getMetric<CompanyPendingValidationInvoiceMetric[]>('c4').then(({ data }) => {
      setInvoices(data)
    })
  }, [])

  return (
    <Card className={cn('flex flex-col justify-between pb-2 h-max', className)}>
      <CardHeader className='items-center pb-0'>
        <CardTitle>Pendientes de validar</CardTitle>
        <CardDescription>Facturas en estado pendiente o corrección</CardDescription>
      </CardHeader>
      <CardContent className='px-2'>
        <div className='overflow-auto max-h-96'>
          <ul className='flex flex-col gap-2'>
            {invoices.length > 0
              ? invoices.map((invoice) => (
                <li key={invoice.id} className='px-4 py-2 rounded-md bg-muted flex flex-col gap-1'>
                  <div className='flex items-center justify-between gap-2'>
                    <span className='text-xs text-muted-foreground'>{new Date(invoice.createdAt).toLocaleDateString(locale)}</span>
                    <ColorBadge color={getStatusBadgeColor(invoice.status)}>
                      {getInvoiceStatusLabel(invoice.status)}
                    </ColorBadge>
                  </div>
                  <div className='flex items-center justify-between gap-2 text-sm'>
                    <Link to={`/invoices/${invoice.id}`} className='font-medium hover:underline'>
                      {invoice.debtorCompanyName || 'Sin deudor'}
                    </Link>
                    <span className='font-bold'>{formatCurrency(invoice.amount, locale)}</span>
                  </div>
                  <span className='text-xs text-muted-foreground'>Vence el {new Date(invoice.dueDate).toLocaleDateString(locale)}</span>
                </li>
              ))
              : <li className='px-4 py-2 text-center text-sm text-muted-foreground'>No hay facturas pendientes de validar</li>}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
