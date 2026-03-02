import StatusBadge from '@/components/status-badge'
import { DebtorStatus, type Debtor } from '@/types/Debtor'
import type { ColumnDef } from '@tanstack/react-table'
import { ExternalLinkIcon } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router'

export function useDebtorColumns (): ColumnDef<Debtor>[] {

  return useMemo(() => [
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
              <StatusBadge color='yellow' />
            )
          case DebtorStatus.VERIFIED:
            return (
              <StatusBadge color='green' />
            )
          case DebtorStatus.CORRECTION:
            return (
              <StatusBadge color='red' />
            )
          case DebtorStatus.DENIED:
            return (
              <StatusBadge color='gray' />
            )
          default:
            return status
        }
      }
    }
  ], [])
}
