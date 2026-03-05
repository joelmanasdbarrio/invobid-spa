import ColorBadge from '@/components/color-badge'
import { DebtorStatus, type Debtor } from '@/types/Debtor'
import type { ColumnDef } from '@tanstack/react-table'
import { CheckCheckIcon, CircleAlertIcon, ClockIcon, ExternalLinkIcon } from 'lucide-react'
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
              <ColorBadge color='yellow' icon={<ClockIcon />}>
                Pendiente
              </ColorBadge>
            )
          case DebtorStatus.VERIFIED:
            return (
              <ColorBadge color='green' icon={<CheckCheckIcon />}>
                Verificado
              </ColorBadge>
            )
          case DebtorStatus.CORRECTION:
            return (
              <ColorBadge color='red' icon={<CircleAlertIcon />}>
                Corrección
              </ColorBadge>
            )
          case DebtorStatus.DENIED:
            return (
              <ColorBadge color='gray' icon={<CircleAlertIcon />}>
                Denegado
              </ColorBadge>
            )
          default:
            return status
        }
      }
    }
  ], [])
}
