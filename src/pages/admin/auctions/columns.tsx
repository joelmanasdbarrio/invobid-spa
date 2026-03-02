import StatusBadge from '@/components/status-badge'
import useLocale from '@/hooks/use-locale'
import { formatCurrency } from '@/lib/format-currency'
import { formatDateTime } from '@/lib/format-date'
import { AuctionStatus, type Auction } from '@/types/Auction'
import type { ColumnDef } from '@tanstack/react-table'
import { ExternalLinkIcon } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router'

export function useAuctionColumns (): ColumnDef<Auction>[] {
  const { locale } = useLocale()

  return useMemo(() => [
    {
      accessorKey: 'id',
      header: '',
      enableHiding: false,
      cell: ({row}) => (
        <Link to={`/admin/auctions/${row.original.id}`}>
          <ExternalLinkIcon className='w-4 h-4' />
        </Link>
      )
    },
    {
      accessorKey: 'invoice.sellerInvestor.companyName',
      header: 'Cedente'
    },
    {
      accessorKey: 'invoice.buyerInvestor.companyName',
      header: 'Inversor'
    },
    {
      accessorKey: 'invoice.debtor.companyName',
      header: 'Deudor'
    },
    {
      accessorKey: 'startingPrice',
      header: 'Precio de salida',
      cell: ({row}) => formatCurrency(row.original.startingPrice, locale, row.original.invoice.currency)
    },
    {
      accessorKey: 'auctionDate.auctionDateStart',
      header: 'Fecha de inicio',
      cell: ({row}) => formatDateTime(row.original.auctionDate.auctionDateStart, locale)
    },
    {
      accessorKey: 'auctionDate.auctionDateEnd',
      header: 'Fecha de finalización',
      cell: ({row}) => formatDateTime(row.original.auctionDate.auctionDateEnd, locale)
    },
    {
      accessorKey: 'status',
      header: 'Estado',
      cell: ({row}) => {
        const status = row.original.status
        switch (status) {
          case AuctionStatus.DRAFT:
            return (
              <StatusBadge color='yellow'>
                Borrador
              </StatusBadge>
            )
          case AuctionStatus.PUBLISHED:
            return (
              <StatusBadge color='green'>
                Publicado
              </StatusBadge>
            )
          case AuctionStatus.CANCELLED:
            return (
              <StatusBadge color='red'>
                Cancelado
              </StatusBadge>
            )
          case AuctionStatus.PAUSED:
            return (
              <StatusBadge color='blue'>
                Pausado
              </StatusBadge>
            )
          case AuctionStatus.FINISHED:
            return (
              <StatusBadge color='purple'>
                Finalizado
              </StatusBadge>
            )
          default:
            return status
        }
      }
    }
  ], [locale])
}
