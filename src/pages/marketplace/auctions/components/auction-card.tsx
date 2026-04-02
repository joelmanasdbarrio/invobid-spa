import { Card, CardContent } from '@/components/ui/card'
import type { Auction } from '@/types/Auction'
import { flexRender, type Row } from '@tanstack/react-table'
import { Link } from 'react-router'

export default function AuctionCard ({ row } : { row: Row<Auction>}) {
  return (
    <Link to={`/marketplace/auctions/${row.original.id}`} className='block w-full h-full overflow-hidden'>
      <Card className='hover:bg-accent h-full block overflow-x-scroll'>
        <CardContent className='flex flex-col gap-4 justify-between h-full'>
          {row.getVisibleCells().map(cell => (
            flexRender(cell.column.columnDef.cell, cell.getContext())
          ))}
        </CardContent>
      </Card>
    </Link>
  )
}
