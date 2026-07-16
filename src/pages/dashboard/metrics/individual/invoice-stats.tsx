import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useLocale } from '@/hooks/use-locale'
import { formatCurrency } from '@/lib/format-currency'
import { cn } from '@/lib/utils.ts'
import { getMetric } from '@/services/metric.api.ts'
import { type UpcomingInvoiceMetric } from '@/types/Metrics'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'

export function InvoiceStats ({ className }: { className?: string }) {
  const [invoicesDue, setInvoicesDue] = useState<UpcomingInvoiceMetric[]>([])

  const { locale } = useLocale()

  useEffect(() => {
    getMetric<UpcomingInvoiceMetric[]>('i11')
      .then(({ data }) => {
        setInvoicesDue(data)
      })
  }, [])

  return (
    <Card
      className={
        cn('flex flex-col justify-between pb-2 h-max', className)
      }
    >
      <CardHeader className='items-center pb-0'>
        <CardTitle>Facturas</CardTitle>
        <CardDescription>Próximas a vencimiento</CardDescription>
      </CardHeader>
      <CardContent className='px-2'>
        <div className='overflow-auto max-h-96'>
          <ul className='flex flex-col gap-2'>{invoicesDue.length > 0 ?
            invoicesDue.map(invoice => {
              const svc = invoice.svc
              const amount = formatCurrency(invoice.amount, locale, invoice.currency || 'EUR')
              const dueDate = new Date(invoice.dueDate)
              const debtorCompanyName = invoice.debtorCompanyName

              return (
                <li key={invoice.id} className='flex flex-col gap-1 px-4 py-2 rounded-md bg-muted'>
                  <div className='flex items-center justify-between text-xs'>
                    <span className='font-medium'>{debtorCompanyName}</span>
                    <span className='text-muted-foreground'>{dueDate.toLocaleDateString(locale)}</span>
                  </div>
                  <Link to={`/marketplace/invoices/${invoice.id}`} className='text-sm text-muted-foreground hover:underline'>{svc}</Link>
                  <span className='ms-auto text-sm font-bold text-muted-foreground'>{amount}</span>
                </li>
              )
            }) : <li className='px-4 py-2 text-center text-sm text-muted-foreground'>No hay facturas próximas a vencimiento</li>}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
