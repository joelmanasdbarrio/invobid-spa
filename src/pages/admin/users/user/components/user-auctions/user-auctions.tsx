import { Button } from '@/components/ui/button.tsx'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select.tsx'
import { DataTable } from '@/pages/admin/users/user/components/user-invoices/data-table'
import { getAuctions } from '@/services/auction.api'
import type { Auction } from '@/types/Auction'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAuctionColumns } from './columns'

export default function UserAuctions ({ investorId } : { investorId: string | undefined }) {
  const auctionColumns = useAuctionColumns()
  const [data, setData] = useState<Auction[]>([])
  const [totalItems, setTotalItems] = useState<number>(0)

  const [currentPage, setCurrentPage] = useState<number>(1)
  const [currentLimit, setCurrentLimit] = useState<number>(10)

  useEffect(() => {
    if (investorId) {
      getAuctions({
        sellerInvestorId: investorId,
        page: String(currentPage),
        limit: String(currentLimit)
      }).then(res => {
        setData(res.data)
        setTotalItems(res._metadata.total)
      })
    }
  }, [investorId, currentLimit, currentPage])

  return (
    <div className='flex flex-col gap-4'>
      <DataTable columns={auctionColumns} data={data} totalItems={totalItems} />

      <div className='flex items-center justify-between gap-2 text-accent-foreground'>
        <div className='flex items-center justify-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeftIcon />
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage * currentLimit >= totalItems}
          >
            <ChevronRightIcon />
          </Button>
          Página {currentPage} de {Math.ceil(totalItems / currentLimit)}
        </div>
        <div className='flex items-center gap-2'>
          <Select value={String(currentLimit)} onValueChange={value => setCurrentLimit(Number(value))}>
            <span className='text-sm'>Filas por página</span>
            <SelectTrigger>
              {currentLimit}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='5'>5</SelectItem>
              <SelectItem value='10'>10</SelectItem>
              <SelectItem value='20'>20</SelectItem>
              <SelectItem value='50'>50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
