import { ColorBadge } from '@/components/color-badge'
import { type Investor, InvestorStatus, InvestorType } from '@/types/User'
import { type ColumnDef } from '@tanstack/react-table'
import {
  BuildingIcon,
  CheckCheckIcon,
  CircleAlertIcon,
  ClockIcon,
  ExternalLinkIcon,
  OctagonXIcon,
  UserIcon
} from 'lucide-react'
import { Link } from 'react-router'

export const investorColumns: ColumnDef<Investor>[] = [
  {
    accessorKey: 'id',
    header: '',
    enableHiding: false,
    cell: ({ row }) => (
      <Link to={`/admin/users/${row.original.id}`}>
        <ExternalLinkIcon className='size-4' />
      </Link>
    )
  },
  {
    accessorKey: 'companyName',
    header: 'Razón social'
  },
  {
    accessorKey: 'documents',
    header: 'CIF/NIF',
    cell: ({ row }) => row.original.documents[0].value || 'N/A'
  },
  {
    accessorKey: 'name',
    header: 'Nombre'
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
    accessorKey: 'investorType',
    header: 'Tipo de inversor',
    cell: ({ row }) => {
      const type = row.original.investorType
      switch (type) {
        case InvestorType.INDIVIDUAL:
          return (
            <span className='flex items-center gap-2'>
              <UserIcon className='size-4' />
              Particular
            </span>
          )
        case InvestorType.COMPANY:
          return (
            <span className='flex items-center gap-2'>
              <BuildingIcon className='size-4' />
              Empresa
            </span>
          )
        default:
          return type
      }
    }
  },
  {
    accessorKey: 'status',
    header: 'Estado',
    cell: ({ row }) => {
      const status = row.original.status
      switch (status) {
        case InvestorStatus.PENDING:
          return (
            <ColorBadge color='yellow' icon={<ClockIcon />}>
              Pendiente
            </ColorBadge>
          )
        case InvestorStatus.VERIFIED:
          return (
            <ColorBadge color='green' icon={<CheckCheckIcon />}>
              Verificado
            </ColorBadge>
          )
        case InvestorStatus.CORRECTION:
          return (
            <ColorBadge color='red' icon={<CircleAlertIcon />}>
              Corrección
            </ColorBadge>
          )
        case InvestorStatus.DENIED:
          return (
            <ColorBadge color='gray' icon={<OctagonXIcon />}>
              Denegado
            </ColorBadge>
          )
        default:
          return status
      }
    }
  }
]
