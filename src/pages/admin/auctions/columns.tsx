import ColorBadge from '@/components/color-badge'
import useLocale from '@/hooks/use-locale'
import { formatCurrency } from '@/lib/format-currency'
import { formatDateTime } from '@/lib/format-date'
import { AuctionStatus, type Auction } from '@/types/Auction'
import type { ColumnDef } from '@tanstack/react-table'
import { CircleCheckIcon, CircleDashedIcon, CircleGaugeIcon, CirclePauseIcon, CircleSlashIcon, ExternalLinkIcon, GavelIcon } from 'lucide-react'
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
          case AuctionStatus.LIVE:
            return (
              <ColorBadge className='motion-safe:animate-pulse motion-safe:animation-duration-[2s]' color='blue' icon={<CircleGaugeIcon className='motion-safe:animate-spin motion-safe:animation-duration-[4s]' />}>
                En curso
              </ColorBadge>
            )
          case AuctionStatus.PAUSED:
            return (
              <ColorBadge color='slate' icon={<CirclePauseIcon />}>
                Pausado
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
