import StatusBadge from '@/components/status-badge'
import { type Debtor, DebtorStatus } from '@/types/Debtor'
import type { ColumnDef } from '@tanstack/react-table'
import { ExternalLinkIcon } from 'lucide-react'
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
            <StatusBadge status='pending' />
          )
        case DebtorStatus.VERIFIED:
          return (
            <StatusBadge status='verified' />
          )
        case DebtorStatus.CORRECTION:
          return (
            <StatusBadge status='correction' />
          )
        case DebtorStatus.DENIED:
          return (
            <StatusBadge status='denied' />
          )
        default:
          return status
      }
    }
  }
]
