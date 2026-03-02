import StatusBadge from '@/components/status-badge'
import useLocale from '@/hooks/use-locale'
import { formatCurrency } from '@/lib/format-currency'
import { formatDate } from '@/lib/format-date'
import { InvoiceStatus, type Invoice } from '@/types/Invoice'
import type { ColumnDef } from '@tanstack/react-table'
import { ExternalLinkIcon } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router'

export function useInvoiceColumns (): ColumnDef<Invoice>[] {
  const { locale } = useLocale()

  return useMemo(() => [
    {
      accessorKey: 'id',
      header: '',
      enableHiding: false,
      cell: ({row}) => (
        <Link to={`/invoices/${row.original.id}`}>
          <ExternalLinkIcon className='w-4 h-4' />
        </Link>
      )
    },
    {
      header: 'Deudor',
      cell: ({row}) => row.original.debtor.companyName
    },
    {
      accessorKey: 'amount',
      header: 'Importe',
      cell: ({row}) => formatCurrency(row.original.amount, locale, row.original.currency)
    },
    {
      header: 'Vendido',
      cell: ({row}) => row.original.buyerInvestor ? (
        row.original.buyerInvestor.companyName
      ) : (
        <span className='text-sm text-gray-500'>No vendido</span>
      )
    },
    {
      accessorKey: 'dueDate',
      header: 'Fecha de vencimiento',
      cell: ({row}) => formatDate(row.original.dueDate, locale)
    },
    {
      accessorKey: 'status',
      header: 'Estado',
      cell: ({row}) => {
        const status = row.original.status
        switch (status) {
          case InvoiceStatus.PENDING:
            return (
              <StatusBadge color='yellow' />
            )
          case InvoiceStatus.VERIFIED:
            return (
              <StatusBadge color='green' />
            )
          case InvoiceStatus.CORRECTION:
            return (
              <StatusBadge color='red' />
            )
          case InvoiceStatus.DENIED:
            return (
              <StatusBadge color='gray' />
            )
          default:
            return status
        }
      }
    }
  ], [locale])
}
