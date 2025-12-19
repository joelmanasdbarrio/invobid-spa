import {type ColumnDef} from '@tanstack/react-table'
import {BuildingIcon, CheckCheckIcon, CircleAlertIcon, ClockIcon, OctagonXIcon, UserIcon} from 'lucide-react'

export type Investor = {
  id: string;
  email: string;
  name: string;
  type: string;
  phoneNumber: number;
  companyName: string;
  investorType: 'individual' | 'company';
  status: 'pending' | 'verified' | 'correction' | 'denied';
  isOptedInNotificationsEmail: boolean;
  isOptedInNotificationsSMS: boolean;
  documents: Array<{
    id: string;
    title: string;
    filename: string;
    value: string;
  }>;
  bankAccount: {
    id: string;
    balance: number;
  }
}

export const investorColumns: ColumnDef<Investor>[] = [
  {
    accessorKey: 'companyName',
    header: 'Razón social'
  },
  {
    accessorKey: 'documents',
    header: 'CIF/NIF',
    cell: ({row}) => row.original.documents[0]?.value || 'N/A'
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
    cell: ({row}) => {
      const type = row.original.investorType
      switch (type) {
        case 'individual':
          return (
            <span className='flex items-center gap-2'>
              <UserIcon className='w-4 h-4' />
              Particular
            </span>
          )
        case 'company':
          return (
            <span className='flex items-center gap-2'>
              <BuildingIcon className='w-4 h-4' />
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
    cell: ({row}) => {
      const status = row.original.status
      switch (status) {
        case 'pending':
          return (
            <span className='flex items-center gap-2'>
              <ClockIcon className='w-5 h-5 rounded-full text-yellow-600 bg-yellow-300/25 p-0.5'/>
              Por verificar
            </span>
          )
        case 'verified':
          return (
            <span className='flex items-center gap-2'>
              <CheckCheckIcon className='w-5 h-5 rounded-full text-green-600 bg-green-300/25 p-0.5'/>
              Verificado
            </span>
          )
        case 'correction':
          return (
            <span className='flex items-center gap-2'>
              <CircleAlertIcon className='w-5 h-5 rounded-full text-red-600 bg-red-300/25 p-0.5'/>
              Corrección requerida
            </span>
          )
        case 'denied':
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
