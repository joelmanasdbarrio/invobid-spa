import { InvoiceStatus, type Invoice } from '@/types/Invoice'
import type { ColumnDef } from '@tanstack/react-table'
import { CheckCheckIcon, CircleAlertIcon, ClockIcon, ExternalLinkIcon, OctagonXIcon } from 'lucide-react'
import { Link } from 'react-router'

export const invoiceColumns: ColumnDef<Invoice>[] = [
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
            <span className='flex items-center gap-2'>
              <ClockIcon className='w-5 h-5 rounded-full text-yellow-600 bg-yellow-300/25 p-0.5'/>
              Por verificar
            </span>
          )
        case InvoiceStatus.VERIFIED:
          return (
            <span className='flex items-center gap-2'>
              <CheckCheckIcon className='w-5 h-5 rounded-full text-green-600 bg-green-300/25 p-0.5'/>
              Verificado
            </span>
          )
        case InvoiceStatus.CORRECTION:
          return (
            <span className='flex items-center gap-2'>
              <CircleAlertIcon className='w-5 h-5 rounded-full text-red-600 bg-red-300/25 p-0.5'/>
              Corrección requerida
            </span>
          )
        case InvoiceStatus.DENIED:
          return (
            <span className='flex items-center gap-2'>
              <OctagonXIcon className='w-5 h-5 rounded-full text-zinc-600 bg-zinc-300/25 p-0.5'/>
              Denegado
            </span>
          )
        default:
          return status
      }
    }
  }
]
