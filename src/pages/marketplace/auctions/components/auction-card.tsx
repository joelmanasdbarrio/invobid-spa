import { Card, CardContent } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import useLoggedInUser from '@/hooks/use-loggedInUser'
import type { Auction } from '@/types/Auction'
import { flexRender, type Row } from '@tanstack/react-table'
import { TrendingUpDownIcon, TrendingUpIcon } from 'lucide-react'
import { Fragment } from 'react'
import { Link } from 'react-router'

export default function AuctionCard ({ row } : { row: Row<Auction>}) {
  const loggedInUser = useLoggedInUser()

  const isWinning = row.original.bids.some(bid => bid.investor && bid.investor.id === loggedInUser?.id) && row.original.bids.length === 1
  const isLosing = row.original.bids.some(bid => bid.investor && bid.investor.id === loggedInUser?.id) && row.original.bids.length > 1

  return (
    <Link to={`/marketplace/auctions/${row.original.id}`} className='block w-full h-full relative rounded-xl overflow-hidden'>
      {isWinning && (
        <Tooltip>
          <TooltipTrigger className='absolute top-2 right-2'>
            <TrendingUpIcon className='size-5 text-green-500' />
          </TooltipTrigger>
          <TooltipContent>
            ¡Tienes la apuesta ganadora!
          </TooltipContent>
        </Tooltip>
      )}
      {isLosing && (
        <Tooltip>
          <TooltipTrigger className='absolute top-2 right-2'>
            <TrendingUpDownIcon className='size-5 text-red-500 animate-pulse' />
          </TooltipTrigger>
          <TooltipContent>
            ¡Han superado tu apuesta!
          </TooltipContent>
        </Tooltip>
      )}
      <Card className={'hover:bg-accent h-full py-0 border-2' + ' ' + (isWinning ? 'border-green-500/30' : isLosing ? 'border-red-500/30' : '')}>
        <CardContent className='flex flex-col gap-4 justify-between h-full overflow-x-auto py-4'>
          {row.getVisibleCells().map(cell => (
            <Fragment key={cell.id}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </Fragment>
          ))}
        </CardContent>
      </Card>
    </Link>
  )
}
