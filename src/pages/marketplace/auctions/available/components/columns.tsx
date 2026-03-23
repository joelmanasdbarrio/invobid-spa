import { ColorBadge } from '@/components/color-badge'
import { useLocale } from '@/hooks/use-locale'
import { formatCurrency } from '@/lib/format-currency'
import { formatDateTime } from '@/lib/format-date'
import { AuctionStatus, type Auction } from '@/types/Auction'
import type { ColumnDef } from '@tanstack/react-table'
import { BadgeEuroIcon, BuildingIcon, CalendarIcon, CalendarXIcon, FileText, HandCoinsIcon, MoveRightIcon, PercentIcon, ShieldCheckIcon, TrendingUpIcon } from 'lucide-react'
import { useMemo } from 'react'
import { ProgressBar } from '../../components/progress-bar'

export function useAuctionColumns (): ColumnDef<Auction>[] {
  const { locale } = useLocale()

  return useMemo(() => [
    {
      header: 'invoice',
      cell: ({row}) => (
        <div className='flex gap-2 items-center'>
          <FileText className='w-4 h-4 text-accent-foreground' />
          <h4 title={`Factura ${row.original.invoice.invoiceId}`}>{row.original.invoice.invoiceId}</h4>
          <ColorBadge
            color={row.original.invoice.rating! >= 4.9 ? 'green' : row.original.invoice.rating! >= 4.5 ? 'yellow' : 'red'}
            icon={<ShieldCheckIcon />}
            className='px-1'
          >
            <span title={`Rating ${row.original.invoice.rating}`}>
              {row.original.invoice.rating}
            </span>
          </ColorBadge>
        </div>
      )
    },
    {
      header: 'auction',
      cell: ({row}) => (
        <div className='grow flex justify-between gap-4'>
          <div className='flex flex-col text-sm'>
            <span className='text-muted-foreground flex items-center gap-2'>
              <BuildingIcon className='w-4 h-4 inline-block' />
              Cedente
            </span>
            <h5 className='ps-6' title={`Cedente ${row.original.invoice.sellerInvestor.companyName}`}>{row.original.invoice.sellerInvestor.companyName}</h5>
          </div>
          <div className='flex flex-col text-sm'>
            <span className='text-muted-foreground flex items-center gap-2'>
              <HandCoinsIcon className='w-4 h-4 inline-block' />
              Deudor
            </span>
            <h5 className='ps-6' title={`Deudor ${row.original.invoice.debtor.companyName}`}>{row.original.invoice.debtor.companyName}</h5>
          </div>
          <div className='flex flex-col text-sm'>
            <span className='text-muted-foreground flex items-center gap-2'>
              <BadgeEuroIcon className='w-4 h-4 inline-block' />
              Importe
            </span>
            <span className='ps-6' title={`Importe ${row.original.invoice.amount}`}>{formatCurrency(row.original.startingPrice, locale, row.original.invoice.currency)}</span>
          </div>
          <div className='flex flex-col text-sm'>
            <span className='text-muted-foreground flex items-center gap-2'>
              <PercentIcon className='w-4 h-4 inline-block' />
              Descuento
            </span>
            <span className='ps-6 text-xl font-bold' title={`Descuento ${Number(row.original.discount).toFixed(2)}%`}>
              {Number(row.original.discount).toFixed(2)}%
            </span>
          </div>
          <div className='flex flex-col text-sm'>
            <span className='text-muted-foreground flex items-center gap-2'>
              <TrendingUpIcon className='w-4 h-4 inline-block' />
              Rentabilidad
            </span>
            <span className='ps-6 text-xl font-bold text-green-500 text-shadow-md' title={`Rentabilidad ${Number(row.original.profitability).toFixed(2)}%`}>
              {Number(row.original.profitability).toFixed(2)}%
            </span>
          </div>
        </div>
      )
    },
    {
      header: 'datetime',
      cell: ({row}) => (
        <div className='grid grid-cols-[auto_1fr] gap-2 text-xs text-muted-foreground items-end'>
          {row.original.status === AuctionStatus.LIVE
            ? (
              <>
                <CalendarIcon className='w-4 h-4 inline-block' />
                <ProgressBar
                  dateStart={row.original.auctionDate.auctionDateStart}
                  dateEnd={row.original.auctionDate.auctionDateEnd}
                />
                <CalendarXIcon className='w-4 h-4 inline-block' />
                {formatDateTime(row.original.invoice.dueDate, locale)}
              </>
            ) : (
              row.original.status === AuctionStatus.PAUSED
                ? (
                  <>
                    <CalendarIcon className='w-4 h-4 inline-block' />
                    <ProgressBar
                      dateStart={row.original.auctionDate.auctionDateStart}
                      dateEnd={row.original.auctionDate.auctionDateEnd}
                      pausedAt={row.original.pausedAt}
                    />
                    <CalendarXIcon className='w-4 h-4 inline-block' />
                    {formatDateTime(row.original.invoice.dueDate, locale)}
                  </>
                ) : (
                  <>
                    <span className='flex gap-2 items-center'>
                      <CalendarIcon className='w-4 h-4 inline-block' />
                      {formatDateTime(row.original.auctionDate.auctionDateStart, locale)} <MoveRightIcon className='w-2 h-2' /> {formatDateTime(row.original.auctionDate.auctionDateEnd, locale)}
                    </span>
                    <span className='text-xs text-muted-foreground flex items-center gap-2 justify-end'>
                      <CalendarXIcon className='w-4 h-4 inline-block' />
                      {formatDateTime(row.original.invoice.dueDate, locale)}
                    </span>
                  </>
                )
            )}
        </div>
      )
    }
  ], [locale])
}
