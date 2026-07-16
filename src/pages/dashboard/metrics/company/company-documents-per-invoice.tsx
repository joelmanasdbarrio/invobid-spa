import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useLocale } from '@/hooks/use-locale'
import { formatCurrency } from '@/lib/format-currency'
import { cn } from '@/lib/utils'
import { getMetric } from '@/services/metric.api'
import { type CompanyDocumentsPerInvoiceMetric } from '@/types/Metrics'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'

export function CompanyDocumentsPerInvoice ({ className }: { className?: string }) {
  const [documentsPerInvoice, setDocumentsPerInvoice] = useState<CompanyDocumentsPerInvoiceMetric[]>([])
  const { locale } = useLocale()

  useEffect(() => {
    getMetric<CompanyDocumentsPerInvoiceMetric[]>('c11').then(({ data }) => {
      setDocumentsPerInvoice(data)
    })
  }, [])

  return (
    <Card className={cn('flex flex-col justify-between pb-2', className)}>
      <CardHeader className='items-center pb-0'>
        <CardTitle>Documentación por factura</CardTitle>
        <CardDescription>Control de facturas con menor número de documentos</CardDescription>
      </CardHeader>
      <CardContent className='px-2'>
        <div className='overflow-auto max-h-96'>
          <ul className='flex flex-col gap-2'>
            {documentsPerInvoice.length > 0
              ? documentsPerInvoice.map((row) => (
                <li key={row.invoiceId} className='px-4 py-2 rounded-md bg-muted flex items-center justify-between gap-2'>
                  <div className='flex flex-col'>
                    <Link to={`/invoices/${row.invoiceId}`} className='text-sm font-medium hover:underline'>
                      Factura {row.invoiceId}
                    </Link>
                    <span className='text-xs text-muted-foreground'>Importe: {formatCurrency(row.amount, locale)}</span>
                  </div>
                  <span className='text-lg font-bold'>{row.documentsCount}</span>
                </li>
              ))
              : <li className='px-4 py-2 text-center text-sm text-muted-foreground'>No hay facturas para revisar</li>}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
