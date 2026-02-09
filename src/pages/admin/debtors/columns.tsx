import { type Debtor, DebtorStatus } from '@/types/Debtor'
import type { ColumnDef } from '@tanstack/react-table'
import { CheckCheckIcon, CircleAlertIcon, ClockIcon, ExternalLinkIcon, OctagonXIcon } from 'lucide-react'
import { Link } from 'react-router'

export const debtorColumns: ColumnDef<Debtor>[] = [
  {
    accessorKey: 'id',
    header: '',
    enableHiding: false,
    cell: ({row}) => (
      <Link to={`/admin/debtors/${row.original.id}`}>
        <ExternalLinkIcon className='w-4 h-4' />
      </Link>
    )
  },
  {
    accessorKey: 'companyName',
    header: 'Razón social'
  },
  {
    accessorKey: 'taxId',
    header: 'CIF/NIF'
  },
  {
    accessorKey: 'email',
    header: 'Email'
  },
  {
    accessorKey: 'phoneNumber',
    header: 'Teléfono'
  },
  {
    accessorKey: 'status',
    header: 'Estado',
    cell: ({row}) => {
      const status = row.original.status
      switch (status) {
        case DebtorStatus.PENDING:
          return (
            <span className='flex items-center gap-2'>
              <ClockIcon className='w-5 h-5 rounded-full text-yellow-600 bg-yellow-300/25 p-0.5'/>
              Por verificar
            </span>
          )
        case DebtorStatus.VERIFIED:
          return (
            <span className='flex items-center gap-2'>
              <CheckCheckIcon className='w-5 h-5 rounded-full text-green-600 bg-green-300/25 p-0.5'/>
              Verificado
            </span>
          )
        case DebtorStatus.CORRECTION:
          return (
            <span className='flex items-center gap-2'>
              <CircleAlertIcon className='w-5 h-5 rounded-full text-red-600 bg-red-300/25 p-0.5'/>
              Corrección requerida
            </span>
          )
        case DebtorStatus.DENIED:
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
