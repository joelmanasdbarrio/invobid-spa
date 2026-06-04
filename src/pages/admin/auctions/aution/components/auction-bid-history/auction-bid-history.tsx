import { Card, CardHeader } from '@/components/ui/card'
import { getBids } from '@/services/bid.api'
import type { Auction } from '@/types/Auction'
import type { Bid } from '@/types/Bid'
import { HistoryIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useBidColumns } from './columns'
import { DataTable } from './data-table'

export function AuctionBidHistory ({ auction }: { auction: Auction | undefined }) {
  const [bidsState, setBidsState] = useState({ bids: [] as Bid[], totalItems: 0, currentPage: 1 })
  const { bids, totalItems, currentPage } = bidsState
  const currentLimit = 10
  const columns = useBidColumns()

  useEffect(() => {
    if (!auction?.id) return

    getBids({
      auctionId: auction.id,
      page: String(currentPage),
      limit: String(currentLimit)
    }).then((res) => {
      setBidsState(prev => ({ ...prev, bids: [...prev.bids, ...res.data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), totalItems: res._metadata.total }))
    })
  }, [auction?.id, currentPage])

  return (
    <Card className='flex flex-col gap-0 overflow-hidden p-0'>
      <CardHeader className='flex flex-row items-center justify-between py-6'>
        <div className='flex items-center gap-2'>
          <span className='rounded-md p-1 bg-primary/20 text-primary'>
            <HistoryIcon className='size-4' />
          </span>
          <h3>Historial de pujas</h3>
        </div>
        <span className='text-xs text-muted-foreground bg-accent px-2 py-0.5 rounded-lg'>
          {totalItems} puja{totalItems !== 1 && 's'}
        </span>
      </CardHeader>
      <div className='flex flex-col gap-4'>
        <DataTable
          columns={columns}
          data={bids}
          totalItems={totalItems}
          onLoadMore={() => setBidsState(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
        />
      </div>
    </Card>
  )
}
