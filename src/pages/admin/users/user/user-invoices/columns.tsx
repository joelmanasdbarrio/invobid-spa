import ColorBadge from '@/components/status-badge'
import useLocale from '@/hooks/use-locale'
import { formatCurrency } from '@/lib/format-currency'
import { formatDate } from '@/lib/format-date'
import { InvoiceStatus, type Invoice } from '@/types/Invoice'
import type { ColumnDef } from '@tanstack/react-table'
import { CheckCheckIcon, CircleAlertIcon, ClockIcon, ExternalLinkIcon, OctagonXIcon } from 'lucide-react'
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
        <Link to={`/admin/invoices/${row.original.id}`}>
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
              <ColorBadge color='yellow' icon={<ClockIcon />}>
                Pendiente
              </ColorBadge>
            )
          case InvoiceStatus.VERIFIED:
            return (
              <ColorBadge color='green' icon={<CheckCheckIcon />}>
                Verificada
              </ColorBadge>
            )
          case InvoiceStatus.CORRECTION:
            return (
              <ColorBadge color='red' icon={<CircleAlertIcon />}>
                Corrección
              </ColorBadge>
            )
          case InvoiceStatus.DENIED:
            return (
              <ColorBadge color='gray' icon={<OctagonXIcon />}>
                Denegada
              </ColorBadge>
            )
          default:
            return status
        }
      }
    }
  ], [locale])
}
