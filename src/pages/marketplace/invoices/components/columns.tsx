import { ColorBadge } from '@/components/color-badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useLocale } from '@/hooks/use-locale'
import { formatCurrency } from '@/lib/format-currency'
import { AuctionStatus } from '@/types/Auction'
import { type Invoice } from '@/types/Invoice'
import type { ColumnDef } from '@tanstack/react-table'
import { BadgeEuroIcon, BuildingIcon, CalendarXIcon, FileTextIcon, HandCoinsIcon, PercentIcon, ShieldCheckIcon, TrendingUpIcon } from 'lucide-react'
import { useMemo } from 'react'
import { ProgressBar } from '../../auctions/components/progress-bar'

export function useMarketplaceInvoiceColumns (): ColumnDef<Invoice>[] {
  const { locale } = useLocale()

  return useMemo(() => [
    {
      header: 'invoice',
      cell: ({ row }) => (
        <div className='flex gap-2 items-center'>
          <FileTextIcon className='size-4 text-accent-foreground' />
          <h4 title={`Factura ${row.original.svc}`}>{row.original.svc}</h4>
          <Tooltip>
            <TooltipTrigger>
              <ColorBadge
                color={(row.original.rating ?? 0) >= 4.9 ? 'green' : (row.original.rating ?? 0) >= 4.5 ? 'yellow' : 'red'}
                icon={<ShieldCheckIcon />}
                className='px-1'
              >
                <span title={`Rating ${row.original.rating}`}>
                  {row.original.rating}
                </span>
              </ColorBadge>
            </TooltipTrigger>
            <TooltipContent className='text-center'>
              Rating de la factura basado en el estudio de solvencia<br />del deudor, proporcionado por {import.meta.env.VITE_APP_NAME}.
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>
              <ColorBadge
                color={(row.original.extRating ?? 0) >= 4.9 ? 'green' : (row.original.extRating ?? 0) >= 4.5 ? 'yellow' : 'red'}
                icon={<ShieldCheckIcon />}
                className='px-1'
              >
                <span title={`Rating externo ${row.original.extRating}`}>
                  {row.original.extRating}
                </span>
              </ColorBadge>
            </TooltipTrigger>
            <TooltipContent className='text-center'>
              Rating de la factura basado en el estudio de solvencia<br />del deudor, proporcionado por {import.meta.env.VITE_EXT_RATING_PROVIDER}.
            </TooltipContent>
          </Tooltip>
        </div>
      )
    },
    {
      header: 'details',
      cell: ({ row }) => (
        <div className='grow flex justify-between gap-4'>
          <div className='flex flex-col text-sm'>
            <span className='text-muted-foreground flex items-center gap-2'>
              <BuildingIcon className='size-4 inline-block' />
              Cedente
            </span>
            <h5 className='ps-6' title={`Cedente ${row.original.sellerInvestor.companyName}`}>{row.original.sellerInvestor.companyName}</h5>
          </div>
          <div className='flex flex-col text-sm'>
            <span className='text-muted-foreground flex items-center gap-2'>
              <HandCoinsIcon className='size-4 inline-block' />
              Deudor
            </span>
            <h5 className='ps-6' title={`Deudor ${row.original.debtor.companyName}`}>{row.original.debtor.companyName}</h5>
          </div>
          <div className='flex flex-col text-sm'>
            <span className='text-muted-foreground flex items-center gap-2'>
              <BadgeEuroIcon className='size-4 inline-block' />
              Importe
            </span>
            <span className='ps-6' title={`Importe ${row.original.amount}`}>{formatCurrency(Number(row.original.auctions.filter(auction => auction.status === AuctionStatus.FINISHED)[0]?.price.end ?? 'N/A'), locale, row.original.currency)}</span>
          </div>
          <div className='flex flex-col text-sm'>
            <span className='text-muted-foreground flex items-center gap-2'>
              <PercentIcon className='size-4 inline-block' />
              Descuento
            </span>
            <span className='ps-6 text-xl font-bold' title={`Descuento ${Number(row.original.auctions.filter(auction => auction.status === AuctionStatus.FINISHED)[0]?.discount.end ?? 0).toFixed(2)}%`}>
              {Number(row.original.auctions.filter(auction => auction.status === AuctionStatus.FINISHED)[0]?.discount.end ?? 0).toFixed(2)}%
            </span>
          </div>
          <div className='flex flex-col text-sm'>
            <span className='text-muted-foreground flex items-center gap-2'>
              <TrendingUpIcon className='size-4 inline-block' />
              Rentabilidad
            </span>
            <span className='ps-6 text-xl font-bold text-green-500 text-shadow-md' title={`Rentabilidad ${Number(row.original.auctions.filter(auction => auction.status === AuctionStatus.FINISHED)[0]?.profitability.end ?? 0).toFixed(2)}%`}>
              {Number(row.original.auctions.filter(auction => auction.status === AuctionStatus.FINISHED)[0]?.profitability.end ?? 0).toFixed(2)}%
            </span>
          </div>
        </div>
      )
    },
    {
      header: 'dueDate',
      cell: ({ row }) => (
        <div className='grid grid-cols-[auto_1fr] gap-2 text-xs text-muted-foreground items-end'>
          <CalendarXIcon className='size-4 inline-block' />
          <ProgressBar
            dateStart={row.original.updatedAt}
            dateEnd={row.original.dueDate}
          />
        </div>
      )
    }
  ], [locale])
}
