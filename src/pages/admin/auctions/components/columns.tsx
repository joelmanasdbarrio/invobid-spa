import { ColorBadge } from '@/components/color-badge'
import { useLocale } from '@/hooks/use-locale'
import { formatCurrency } from '@/lib/format-currency'
import { formatDateTime } from '@/lib/format-date'
import { AuctionStatus, type Auction } from '@/types/Auction'
import type { ColumnDef } from '@tanstack/react-table'
import { CircleCheckIcon, CircleDashedIcon, CircleGaugeIcon, CircleSlashIcon, ExternalLinkIcon, GavelIcon } from 'lucide-react'
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
      accessorKey: 'invoice.debtor.companyName',
      header: 'Deudor'
    },
    {
      accessorKey: 'invoice.buyerInvestor.companyName',
      header: 'Inversor'
    },
    {
      accessorKey: 'startingPrice',
      header: 'Precio de salida',
      cell: ({row}) => formatCurrency(row.original.startingPrice, locale, row.original.invoice.currency)
    },
    {
      header: 'Fecha de inicio',
      cell: ({row}) => formatDateTime(row.original.auctionDate.auctionDateStart, locale)
    },
    {
      header: 'Fecha de finalización',
      cell: ({row}) => formatDateTime(row.original.auctionDate.auctionDateEnd, locale)
    },
    {
      header: 'Estado',
      cell: ({row}) => {
        const status = row.original.status

        switch (status) {
          case AuctionStatus.DRAFT:
            return (
              <ColorBadge color='yellow' icon={<CircleDashedIcon />}>
                Borrador
              </ColorBadge>
            )
          case AuctionStatus.PUBLISHED:
            return (
              <ColorBadge color='green' icon={<CircleCheckIcon />}>
                Publicado
              </ColorBadge>
            )
          case AuctionStatus.TRANSITIONING:
            return (
              <ColorBadge color='blue' icon={<CircleGaugeIcon />}>
                En transición
              </ColorBadge>
            )
          case AuctionStatus.CANCELLED:
            return (
              <ColorBadge color='red' icon={<CircleSlashIcon />}>
                Cancelado
              </ColorBadge>
            )
          case AuctionStatus.FINISHED:
            return (
              <ColorBadge color='purple' icon={<GavelIcon />}>
                Finalizado
              </ColorBadge>
            )
          default:
            return status
        }
      }
    }
  ], [locale])
}
