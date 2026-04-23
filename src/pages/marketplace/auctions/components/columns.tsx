import { ColorBadge } from '@/components/color-badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useLocale } from '@/hooks/use-locale'
import { formatCurrency } from '@/lib/format-currency'
import { formatDateTime } from '@/lib/format-date'
import { type Auction } from '@/types/Auction'
import type { ColumnDef } from '@tanstack/react-table'
import { BadgeEuroIcon, BuildingIcon, CalendarIcon, CalendarXIcon, FileText, HandCoinsIcon, PercentIcon, ShieldCheckIcon, TrendingUpIcon } from 'lucide-react'
import { useMemo } from 'react'
import { ProgressBar } from './progress-bar'

export function useAuctionColumns (): ColumnDef<Auction>[] {
  const { locale } = useLocale()

  return useMemo(() => [
    {
      header: 'invoice',
      cell: ({row}) => (
        <div className='flex gap-2 items-center'>
          <FileText className='w-4 h-4 text-accent-foreground' />
          <h4 title={`Factura ${row.original.invoice.svc}`}>{row.original.invoice.svc}</h4>
          <Tooltip>
            <TooltipTrigger>
              <ColorBadge
                color={(row.original.invoice.rating ?? 0) >= 4.9 ? 'green' : (row.original.invoice.rating ?? 0) >= 4.5 ? 'yellow' : 'red'}
                icon={<ShieldCheckIcon/>}
                className='px-1'
              >
                <span title={`Rating ${row.original.invoice.rating}`}>
                  {row.original.invoice.rating}
                </span>
              </ColorBadge>
            </TooltipTrigger>
            <TooltipContent className='text-center'>Rating de la factura basado en el estudio de solvencia<br />del deudor, proporcionado por {import.meta.env.VITE_APP_NAME}.</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>
              <ColorBadge
                color={(row.original.invoice.extRating ?? 0) >= 4.9 ? 'green' : (row.original.invoice.extRating ?? 0) >= 4.5 ? 'yellow' : 'red'}
                icon={<ShieldCheckIcon/>}
                className='px-1'
              >
                <span title={`Rating ${row.original.invoice.extRating}`}>
                  {row.original.invoice.extRating}
                </span>
              </ColorBadge>
            </TooltipTrigger>
            <TooltipContent className='text-center'>Rating de la factura basado en el estudio de solvencia<br />del deudor, proporcionado por {import.meta.env.VITE_EXT_RATING_PROVIDER}.</TooltipContent>
          </Tooltip>
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
            <span className='ps-6' title={`Importe ${row.original.invoice.amount}`}>{formatCurrency(Number(row.original.bids[0]?.amount ?? row.original.price.start), locale, row.original.invoice.currency)}</span>
          </div>
          <div className='flex flex-col text-sm'>
            <span className='text-muted-foreground flex items-center gap-2'>
              <PercentIcon className='w-4 h-4 inline-block' />
              Descuento
            </span>
            <span className='ps-6 text-xl font-bold' title={`Descuento ${Number(row.original.bids[0]?.discount ?? row.original.discount.start).toFixed(2)}%`}>
              {Number(row.original.bids[0]?.discount ?? row.original.discount.start).toFixed(2)}%
            </span>
          </div>
          <div className='flex flex-col text-sm'>
            <span className='text-muted-foreground flex items-center gap-2'>
              <TrendingUpIcon className='w-4 h-4 inline-block' />
              Rentabilidad
            </span>
            <span className='ps-6 text-xl font-bold text-green-500 text-shadow-md' title={`Rentabilidad ${Number(row.original.bids[0]?.profitability ?? row.original.profitability.start).toFixed(2)}%`}>
              {Number(row.original.bids[0]?.profitability ?? row.original.profitability.start).toFixed(2)}%
            </span>
          </div>
        </div>
      )
    },
    {
      header: 'datetime',
      cell: ({row}) => (
        <div className='grid grid-cols-[auto_1fr] gap-2 text-xs text-muted-foreground items-end'>
          {row.original.date.start &&
          // ? (
          <>
            <CalendarIcon className='w-4 h-4 inline-block' />
            <ProgressBar
              dateStart={row.original.date.start}
              dateEnd={row.original.date.end}
            />
            <CalendarXIcon className='w-4 h-4 inline-block' />
            {formatDateTime(row.original.invoice.dueDate, locale)}
          </>
            // ) : (
            //   <>
            //     <span className='flex gap-2 items-center'>
            //       <CalendarIcon className='w-4 h-4 inline-block' />
            //       {formatDateTime(row.original.date.start, locale)} <MoveRightIcon className='w-2 h-2' /> {formatDateTime(row.original.date.end, locale)}
            //     </span>
            //     <span className='text-xs text-muted-foreground flex items-center gap-2 justify-end'>
            //       <CalendarXIcon className='w-4 h-4 inline-block' />
            //       {formatDateTime(row.original.invoice.dueDate, locale)}
            //     </span>
            //   </>
          }
        </div>
      )
    }
  ], [locale])
}
