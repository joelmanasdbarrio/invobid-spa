import StatusBadge from '@/components/status-badge'
import { InvoiceStatus, type Invoice } from '@/types/Invoice'
import type { ColumnDef } from '@tanstack/react-table'
import { ExternalLinkIcon } from 'lucide-react'
import { Link } from 'react-router'

export const invoiceColumns: ColumnDef<Invoice>[] = [
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
    cell: ({row}) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(row.original.amount)
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
    cell: ({row}) => new Date(row.original.dueDate).toLocaleDateString('es-ES')
  },
  {
    accessorKey: 'status',
    header: 'Estado',
    cell: ({row}) => {
      const status = row.original.status
      switch (status) {
        case InvoiceStatus.PENDING:
          return (
            <StatusBadge status='pending' />
          )
        case InvoiceStatus.VERIFIED:
          return (
            <StatusBadge status='verified' />
          )
        case InvoiceStatus.CORRECTION:
          return (
            <StatusBadge status='correction' />
          )
        case InvoiceStatus.DENIED:
          return (
            <StatusBadge status='denied' />
          )
        default:
          return status
      }
    }
  }
]
